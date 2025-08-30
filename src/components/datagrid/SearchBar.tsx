import React from "react";

export default function SearchBar({
  value, onChange, placeholder,
}: { value: string; onChange: (val: string) => void; placeholder?: string }) {
  return (
    <div className="flex items-center gap-2 border border-gray-300 rounded-md px-3 py-2 bg-white w-64">
      <span className="text-gray-400">🔍</span>
      <input
        className="w-full outline-none text-sm"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}
