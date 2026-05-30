import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const daysOfWeek = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

// Generate time options every 30 minutes from 6:00 AM to 10:00 PM
const generateTimeOptions = () => {
  const options = [];

  for (let hour = 6; hour <= 22; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 22 && minute === 30) continue;

      const date = new Date();
      date.setHours(hour, minute);

      const label = date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });

      const value = `${String(hour).padStart(2, "0")}:${String(
        minute
      ).padStart(2, "0")}`;

      options.push({
        label,
        value,
      });
    }
  }

  return options;
};

const timeOptions = generateTimeOptions();

export default function AvailabilityPage() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchAvailability();
  }, []);

  const defaultSchedule = daysOfWeek.map((day) => ({
    day,
    enabled: false,
    start_time: "09:00",
    end_time: "17:00",
  }));

  const fetchAvailability = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("availability")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Error loading availability:", error);
      setSchedule(defaultSchedule);
      setLoading(false);
      return;
    }

    if (!data || data.length === 0) {
      setSchedule(defaultSchedule);
      setLoading(false);
      return;
    }

    const mergedSchedule = daysOfWeek.map((day) => {
      const existing = data.find((item) => item.day === day);

      return (
        existing || {
          day,
          enabled: false,
          start_time: "09:00",
          end_time: "17:00",
        }
      );
    });

    setSchedule(mergedSchedule);
    setLoading(false);
  };

  const handleToggle = (index) => {
    const updated = [...schedule];

    updated[index].enabled = !updated[index].enabled;

    setSchedule(updated);
  };

  const handleTimeChange = (index, field, value) => {
    const updated = [...schedule];

    updated[index][field] = value;

    setSchedule(updated);
  };

  const saveSchedule = async () => {
    setSaving(true);

    const payload = schedule.map((item) => ({
      day: item.day,
      enabled: item.enabled,
      start_time: item.start_time,
      end_time: item.end_time,
    }));

    const { error } = await supabase
      .from("availability")
      .upsert(payload, {
        onConflict: "day",
      });

    setSaving(false);

    if (error) {
      console.error("Error saving schedule:", error);
      alert("Failed to save schedule.");
      return;
    }

    setToast("Schedule saved successfully!");

    setTimeout(() => {
      setToast("");
    }, 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading schedule...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-md p-6">
        <h1 className="text-3xl font-bold mb-8 text-gray-800">
          Weekly Availability
        </h1>

        <div className="space-y-4">
          {schedule.map((item, index) => (
            <div
              key={item.day}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center border border-gray-200 rounded-xl p-4"
            >
              {/* Day Name */}
              <div className="font-semibold text-gray-700">
                {item.day}
              </div>

              {/* Toggle */}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleToggle(index)}
                  className={`w-14 h-8 flex items-center rounded-full p-1 transition ${
                    item.enabled ? "bg-green-500" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`bg-white w-6 h-6 rounded-full shadow-md transform transition ${
                      item.enabled ? "translate-x-6" : ""
                    }`}
                  />
                </button>

                <span className="text-sm text-gray-600">
                  {item.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {/* Start Time */}
              <select
                value={item.start_time}
                disabled={!item.enabled}
                onChange={(e) =>
                  handleTimeChange(index, "start_time", e.target.value)
                }
                className={`border rounded-lg px-3 py-2 w-full ${
                  item.enabled
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>

              {/* End Time */}
              <select
                value={item.end_time}
                disabled={!item.enabled}
                onChange={(e) =>
                  handleTimeChange(index, "end_time", e.target.value)
                }
                className={`border rounded-lg px-3 py-2 w-full ${
                  item.enabled
                    ? "bg-white border-gray-300"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                {timeOptions.map((time) => (
                  <option key={time.value} value={time.value}>
                    {time.label}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-end">
          <button
            onClick={saveSchedule}
            disabled={saving}
            className="bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-800 transition disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Schedule"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}