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
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{item.name}</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                        Item details and management
                    </p>
                </div>
            </div>

            {/* Item Details Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Item Information</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Quantity:</span>
                        <span className="text-gray-900 dark:text-white">{item.quantity}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Status:</span>
                        <span className="text-gray-900 dark:text-white">{item.status || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Room:</span>
                        <span className="text-gray-900 dark:text-white">{item.room?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Place:</span>
                        <span className="text-gray-900 dark:text-white">{item.place?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Container:</span>
                        <span className="text-gray-900 dark:text-white">{item.container?.name || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="font-medium text-gray-700 dark:text-gray-300">Tags:</span>
                        <span className="text-gray-900 dark:text-white">{item.tags && item.tags.length > 0 ? item.tags.join(", ") : "-"}</span>
                    </div>
                </div>
            </div>

            {/* Actions Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <ManageObjectClient item={item} />
            </div>

            {/* Quantity Alert Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Quantity alert</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-4">No quantity alert configured for this object.</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    To edit or delete this object, use the buttons above. If you can&apos;t find the object, check if it&apos;s in another room.
                </p>
            </div>
        </div>
    );
}
