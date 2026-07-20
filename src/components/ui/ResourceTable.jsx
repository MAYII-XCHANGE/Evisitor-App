import { EmptyState } from "./EmptyState";

const readValue = (row, accessor) => typeof accessor === "function" ? accessor(row) : row[accessor];

export const ResourceTable = ({ columns, rows = [], rowKey = "id", emptyTitle, emptyMessage }) => {
  if (!rows.length) return <EmptyState title={emptyTitle} message={emptyMessage} />;
  return (
    <div className="table-scroll overflow-x-auto">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-wide text-gray-500">
          <tr>
            {columns.map((column) => (
              <th key={column.header} className="border-b border-gray-100 bg-surface-muted px-4 py-3 font-bold dark:border-slate-800 dark:bg-slate-950">
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={readValue(row, rowKey)}>
              {columns.map((column) => {
                const value = readValue(row, column.accessor);
                return (
                  <td key={column.header} className="border-b border-gray-100 px-4 py-4 text-gray-700 dark:border-slate-800 dark:text-slate-200">
                    {column.cell ? column.cell(value, row) : value ?? "—"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
