// Filename: src/components/ColorPicker.jsx

import { useRef } from "react";

const PRESETS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f43f5e",
  "#f97316", "#eab308", "#22c55e", "#14b8a6",
  "#3b82f6", "#0ea5e9", "#1e293b", "#334155",
];

export default function ColorPicker({ value, onChange, label = "Brand Color" }) {
  const inputRef = useRef(null);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-semibold text-slate-700 tracking-wide uppercase">
        {label}
      </label>

      {/* Main row: swatch trigger + hex input */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-11 h-11 rounded-xl border-2 border-white shadow-md ring-1 ring-slate-200 transition-transform hover:scale-105 active:scale-95 flex-shrink-0"
          style={{ backgroundColor: value }}
          aria-label="Open color picker"
        />
        <input
          ref={inputRef}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="sr-only"
        />
        <input
          type="text"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) onChange(v);
          }}
          maxLength={7}
          className="flex-1 px-3 py-2 text-sm font-mono bg-slate-50 border border-slate-200 rounded-lg
                     focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent
                     text-slate-700 placeholder:text-slate-400"
          placeholder="#000000"
        />
      </div>

      {/* Preset swatches */}
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className="w-7 h-7 rounded-lg border-2 transition-all hover:scale-110 active:scale-95"
            style={{
              backgroundColor: color,
              borderColor: value === color ? "white" : "transparent",
              boxShadow: value === color ? `0 0 0 2px ${color}` : "none",
            }}
            title={color}
            aria-label={`Select color ${color}`}
          />
        ))}
      </div>
    </div>
  );
}