// Filename: src/pages/SettingsPage.jsx

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import ColorPicker from "../components/ColorPicker";

// ─── Supabase client ─────────────────────────────────────────────────────────
// Replace these with your actual env vars (Vite: import.meta.env.VITE_*)
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

// ─── Constants ────────────────────────────────────────────────────────────────
const SERVICE_TYPES = [
  "Hair Stylist",
  "Barber",
  "Personal Trainer",
  "Tutor",
  "Massage Therapist",
  "Cleaning Service",
  "Nail Tech",
  "Makeup Artist",
  "Other",
];

const BOOKING_DOMAIN = "yourdomain.com/book/";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 60);
}

function hexToRgb(hex) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `${r}, ${g}, ${b}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, icon, children }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
        <span className="text-xl">{icon}</span>
        <h2 className="font-semibold text-slate-800 text-base tracking-tight">{title}</h2>
      </div>
      <div className="px-6 py-5 space-y-5">{children}</div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-slate-700 tracking-wide uppercase">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-slate-400">{hint}</p>}
    </div>
  );
}

const inputCls =
  "w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl " +
  "focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent " +
  "text-slate-800 placeholder:text-slate-400 transition";

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SettingsPage() {
  // Form state
  const [form, setForm] = useState({
    business_name: "",
    owner_name: "",
    service_type: "",
    description: "",
    slug: "",
    brand_color: "#6366f1",
    phone: "",
    city: "",
    logo_url: "",
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [businessId, setBusinessId] = useState(null);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);
  const slugUserEdited = useRef(false);

  // ── Load on mount ──────────────────────────────────────────────────────────
  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setStatus({ type: "error", message: "You must be logged in to access settings." });
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (error && error.code !== "PGRST116") throw error; // PGRST116 = no rows

        if (data) {
          setBusinessId(data.id);
          setForm({
            business_name: data.business_name ?? "",
            owner_name: data.owner_name ?? "",
            service_type: data.service_type ?? "",
            description: data.description ?? "",
            slug: data.slug ?? "",
            brand_color: data.brand_color ?? "#6366f1",
            phone: data.phone ?? "",
            city: data.city ?? "",
            logo_url: data.logo_url ?? "",
          });
          if (data.logo_url) setLogoPreview(data.logo_url);
        }
      } catch (err) {
        setStatus({ type: "error", message: "Failed to load settings: " + err.message });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // ── Field change handler ───────────────────────────────────────────────────
  const handleChange = useCallback(
    (field) => (eOrValue) => {
      const value =
        typeof eOrValue === "string" ? eOrValue : eOrValue.target.value;

      setForm((prev) => {
        const next = { ...prev, [field]: value };

        // Auto-generate slug from business name, unless user manually edited slug
        if (field === "business_name" && !slugUserEdited.current) {
          next.slug = slugify(value);
        }
        if (field === "slug") {
          slugUserEdited.current = true;
          next.slug = slugify(value);
        }

        return next;
      });
    },
    []
  );

  // ── Logo handling ──────────────────────────────────────────────────────────
  const handleLogoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };

  const uploadLogo = async (userId) => {
    if (!logoFile) return form.logo_url;
    const ext = logoFile.name.split(".").pop();
    const path = `logos/${userId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage
      .from("business-assets")
      .upload(path, logoFile, { upsert: true });
    if (error) throw new Error("Logo upload failed: " + error.message);
    const { data: urlData } = supabase.storage
      .from("business-assets")
      .getPublicUrl(path);
    return urlData.publicUrl;
  };

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated.");

      // Validate required fields
      if (!form.business_name.trim()) throw new Error("Business name is required.");
      if (!form.slug.trim()) throw new Error("Booking URL slug is required.");

      const logo_url = await uploadLogo(user.id);

      const payload = {
        user_id: user.id,
        business_name: form.business_name.trim(),
        owner_name: form.owner_name.trim(),
        service_type: form.service_type,
        description: form.description.trim(),
        slug: form.slug.trim(),
        brand_color: form.brand_color,
        phone: form.phone.trim(),
        city: form.city.trim(),
        logo_url,
        updated_at: new Date().toISOString(),
      };

      let error;
      if (businessId) {
        ({ error } = await supabase
          .from("businesses")
          .update(payload)
          .eq("id", businessId));
      } else {
        const { data, error: insertError } = await supabase
          .from("businesses")
          .insert(payload)
          .select("id")
          .single();
        error = insertError;
        if (data) setBusinessId(data.id);
      }

      if (error) throw error;

      setForm((prev) => ({ ...prev, logo_url }));
      setStatus({ type: "success", message: "Settings saved successfully!" });
      setLogoFile(null);
    } catch (err) {
      setStatus({ type: "error", message: err.message });
    } finally {
      setSaving(false);
    }
  };

  // ── Derived UI values ──────────────────────────────────────────────────────
  const brandRgb = form.brand_color.length === 7 ? hexToRgb(form.brand_color) : "99, 102, 241";

  // ── Render ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-500">Loading your settings…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* ── Header ── */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-slate-100 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">Business Settings</h1>
            <p className="text-xs text-slate-400 mt-0.5">Customize your public booking page</p>
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold shadow"
            style={{ backgroundColor: form.brand_color }}
          >
            {form.business_name?.[0]?.toUpperCase() || "B"}
          </div>
        </div>
      </header>

      {/* ── Body ── */}
      <main className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status banner */}
        {status && (
          <div
            className={`flex items-start gap-3 px-4 py-3 rounded-xl text-sm font-medium border ${
              status.type === "success"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            <span>{status.type === "success" ? "✓" : "✕"}</span>
            <span>{status.message}</span>
            <button
              onClick={() => setStatus(null)}
              className="ml-auto opacity-60 hover:opacity-100 transition"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* ── Business Info ── */}
          <SectionCard title="Business Info" icon="🏢">
            <Field label="Business Name">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Glam Studio"
                value={form.business_name}
                onChange={handleChange("business_name")}
                required
              />
            </Field>

            <Field label="Owner Name">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Jordan Smith"
                value={form.owner_name}
                onChange={handleChange("owner_name")}
              />
            </Field>

            <Field label="Service Type">
              <select
                className={inputCls}
                value={form.service_type}
                onChange={handleChange("service_type")}
              >
                <option value="" disabled>
                  Select a service type…
                </option>
                {SERVICE_TYPES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Short Description"
              hint={`${form.description.length}/200 characters`}
            >
              <textarea
                className={inputCls + " resize-none h-24"}
                placeholder="Tell clients what makes your service special…"
                maxLength={200}
                value={form.description}
                onChange={handleChange("description")}
              />
            </Field>

            <Field
              label="Booking Page URL"
              hint="Auto-generated from your business name — you can customize it."
            >
              <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 overflow-hidden focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent transition">
                <span className="px-3 py-2.5 text-sm text-slate-400 bg-slate-100 border-r border-slate-200 whitespace-nowrap select-none">
                  {BOOKING_DOMAIN}
                </span>
                <input
                  type="text"
                  className="flex-1 px-3 py-2.5 text-sm bg-transparent focus:outline-none text-slate-800"
                  value={form.slug}
                  onChange={handleChange("slug")}
                  placeholder="your-business"
                  required
                />
              </div>
              {form.slug && (
                <p className="text-xs text-indigo-500 mt-1">
                  🔗 {BOOKING_DOMAIN}
                  {form.slug}
                </p>
              )}
            </Field>
          </SectionCard>

          {/* ── Branding ── */}
          <SectionCard title="Branding" icon="🎨">
            {/* Brand Color */}
            <ColorPicker
              value={form.brand_color}
              onChange={handleChange("brand_color")}
            />

            {/* Live preview */}
            <div
              className="rounded-2xl p-5 transition-colors duration-300"
              style={{
                background: `linear-gradient(135deg, rgba(${brandRgb},0.12) 0%, rgba(${brandRgb},0.04) 100%)`,
                border: `1.5px solid rgba(${brandRgb},0.25)`,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo"
                    className="w-10 h-10 rounded-xl object-cover"
                  />
                ) : (
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm"
                    style={{ backgroundColor: form.brand_color }}
                  >
                    {form.business_name?.[0]?.toUpperCase() || "B"}
                  </div>
                )}
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: form.brand_color }}
                  >
                    {form.business_name || "Your Business"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {form.service_type || "Service Type"}
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="w-full py-2 rounded-xl text-white text-sm font-semibold shadow transition hover:opacity-90"
                style={{ backgroundColor: form.brand_color }}
              >
                Book an Appointment
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                ↑ Live preview of your booking page header
              </p>
            </div>

            {/* Logo Upload */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-slate-700 tracking-wide uppercase">
                Logo
              </label>
              <div
                className="flex items-center gap-4 p-4 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition"
                onClick={() => fileInputRef.current?.click()}
              >
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="w-16 h-16 rounded-xl object-cover border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-slate-200 flex items-center justify-center text-2xl">
                    🖼️
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium text-slate-700">
                    {logoPreview ? "Change logo" : "Upload logo"}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    PNG, JPG or WebP · Max 5MB
                  </p>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleLogoChange}
                className="sr-only"
              />
            </div>
          </SectionCard>

          {/* ── Contact ── */}
          <SectionCard title="Contact" icon="📞">
            <Field label="Phone Number">
              <input
                type="tel"
                className={inputCls}
                placeholder="e.g. +1 (555) 000-0000"
                value={form.phone}
                onChange={handleChange("phone")}
              />
            </Field>

            <Field label="Location / City" hint="Shown on your public booking page.">
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Los Angeles, CA"
                value={form.city}
                onChange={handleChange("city")}
              />
            </Field>
          </SectionCard>

          {/* ── Save Button ── */}
          <div className="flex items-center justify-between pt-2">
            {status?.type === "success" && (
              <p className="text-sm text-emerald-600 font-medium">✓ All changes saved</p>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-sm font-semibold shadow-md
                           transition hover:opacity-90 active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ backgroundColor: form.brand_color }}
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Saving…
                  </>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}