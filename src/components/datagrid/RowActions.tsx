import React from "react";

export default function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex gap-2 justify-end">
      <button onClick={onEdit} className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm">
        Editar
      </button>
      <button onClick={onDelete} className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm">
        Eliminar
      </button>
    </div>
  );
}
