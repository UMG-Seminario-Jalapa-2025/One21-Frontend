import React from "react";

export type ColumnDef<T> = {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
};

interface Props<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  emptyMessage?: string;
}

export default function DataGrid<T>({ columns, rows, emptyMessage }: Props<T>) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-700">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-4 py-2 text-left font-medium">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center p-6 text-gray-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            rows.map((row, i) => (
              <tr key={i} className="border-t hover:bg-gray-50">
                {columns.map((c) => (
                  <td key={c.key} className="px-4 py-2">
                    {c.render ? c.render(row) : (row as any)[c.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
