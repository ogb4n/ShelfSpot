"use client"
import ManageObjectClient from "@/components/ManageObjectClient";
import useGetItems from "@/app/hooks/useGetItems";
import { useParams } from "next/navigation";

export default function ManageObjectPage() {
    const params = useParams();
    const id = Array.isArray(params.id) ? params.id[0] : params.id;
    const { data, loading, error } = useGetItems(id);

    if (!id) {
        return (
            <main className="max-w-2xl mx-auto p-8 theme-bg">
                <h1 className="text-2xl font-bold mb-4">Missing parameter</h1>
                <p className="theme-muted">No ID provided.</p>
            </main>
        );
    }

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error : {error}</div>;
    if (!data || Array.isArray(data)) return <div>No object found.</div>;

    const item = data;

    return (
        <main className="max-w-2xl mx-auto p-8 theme-bg rounded-xl shadow-xl backdrop-blur-md bg-white/30 border border-white/30">
            <div className="flex items-center gap-4 mb-6">
                <h1 className="text-3xl font-bold">{item.name}</h1>
            </div>
            <div className="theme-card theme-border rounded-lg shadow p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <span className="font-semibold">Quantity:</span> {item.quantity}
                </div>
                <div>
                    <span className="font-semibold">Status:</span> {item.status || "-"}
                </div>
                <div>
                    <span className="font-semibold">Room:</span> {item.room?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Place:</span> {item.place?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Container:</span> {item.container?.name || "-"}
                </div>
                <div>
                    <span className="font-semibold">Tags:</span> {item.tags && item.tags.length > 0 ? item.tags.join(", ") : "-"}
                </div>
            </div>
            <ManageObjectClient item={item} />
            <div className="mt-8">
                <h2 className="text-xl font-semibold mb-2">Quantity alert</h2>
                <div className="theme-muted">No quantity alert configured for this object.</div>
            </div>
            <p className="text-sm theme-muted mt-2">
                To edit or delete this object, use the buttons below. If you can't find the object, check if it's in another room.
            </p>
        </main>
    );
}
