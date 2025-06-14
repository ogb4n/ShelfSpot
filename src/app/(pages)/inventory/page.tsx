"use client";

import ItemsTable from "@/components/ItemsTable";

export default function InventoryPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Inventory</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Browse and manage all items in your house</p>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
                <ItemsTable
                    columns={[
                        "name",
                        "quantity",
                        "status",
                        "room",
                        "place",
                        "container",
                        "tags",
                        "actions"
                    ]}
                    showCreateForm={false}
                />
            </div>
        </div>
    );
}
