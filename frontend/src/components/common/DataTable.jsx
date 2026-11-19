import { EmptyState, Spinner } from '@/components/common/Loading';

// columns: [{ key, label, render?: (row) => node }]
export default function DataTable({ columns, data, loading, emptyTitle, emptyDescription, onRowClick }) {
  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <EmptyState title={emptyTitle || 'No records found'} description={emptyDescription} />;
  }

  return (
    <div className="overflow-x-auto -mx-5 sm:-mx-6 px-5 sm:px-6">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left">
            {columns.map((col) => (
              <th key={col.key} className="pb-3 pr-4 text-[10px] font-bold uppercase tracking-[0.12em] text-ink/45 whitespace-nowrap">
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {data.map((row, idx) => (
            <tr
              key={row._id || idx}
              onClick={() => onRowClick?.(row)}
              className={`transition-colors ${onRowClick ? 'cursor-pointer hover:bg-brand-light/30' : 'hover:bg-paper/60'}`}
            >
              {columns.map((col) => (
                <td key={col.key} className="py-4 pr-4 text-ink whitespace-nowrap">
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
