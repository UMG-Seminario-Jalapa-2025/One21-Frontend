// PageSizer.tsx
import React from "react";

const OPTIONS = [5, 10, 25, 50];

export default function PageSizer({ value, onChange }: { value: number; onChange: (val: number) => void }) {
  return (
    <select
      className="border border-gray-300 rounded-md px-2 py-1"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
    >
      {OPTIONS.map((n) => (
        <option key={n} value={n}>{n}</option>
      ))}
    </select>
  );
}

