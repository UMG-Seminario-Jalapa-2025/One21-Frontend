import React from "react";

export default function StatusSwitch({ checked, onChange }: { checked: boolean; onChange: (val: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-10 h-5 flex items-center rounded-full p-1 transition-colors ${
        checked ? "bg-blue-600" : "bg-gray-300"
      }`}
      aria-pressed={checked}
      title={checked ? "Activo" : "Inactivo"}
    >
      <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
        checked ? "translate-x-5" : ""
      }`} />
    </button>
  );
}
