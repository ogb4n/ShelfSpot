import { Button } from "@/components/ui/button";

interface TablePaginationProps {
    page: number;
    totalPages: number;
    pageSize: number;
    setPage: (page: number) => void;
    setPageSize: (size: number) => void;
    pageSizeOptions: number[];
}

export default function TablePagination({
    page,
    totalPages,
    pageSize,
    setPage,
    setPageSize,
    pageSizeOptions,
}: TablePaginationProps) {
    return (
        <div className="flex justify-between items-center mt-4 gap-4">
            <div className="flex items-center gap-2">
                <span>Show</span>
                <select
                    className="theme-input rounded px-2 py-1"
                    value={pageSize}
                    onChange={e => {
                        setPageSize(Number(e.target.value));
                        setPage(1);
                    }}
                >
                    {pageSizeOptions.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                <span>rows</span>
            </div>
            <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>
                    Previous
                </Button>
                <span>{page} / {totalPages}</span>
                <Button size="sm" variant="ghost" onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages}>
                    Next
                </Button>
            </div>
        </div>
    );
}
