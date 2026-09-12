"use client";

import React, { useState } from "react";

interface SchemaProperty {
    type?: string;
    title?: string;
}

interface Schema {
    properties?: Record<string, SchemaProperty>;
    required?: string[];
}

type FormRow = Record<string, string | number | boolean | null | undefined>;

// Rows carry a stable id so React keys don't rely on array index — removing a
// row in the middle would otherwise shift every later row's key and lose its
// input state (focus, in-progress edit) to the row that inherits its index.
type IdentifiedRow = { id: string; data: FormRow };

interface DynamicSchemaFormProps {
    readonly schema: Schema;
    readonly initialRows?: FormRow[];
    readonly onSubmit: (rows: FormRow[]) => Promise<void> | void;
    readonly options?: { [key: string]: Array<{ value: string | number; label: string }> };
}

const toIdentifiedRows = (rows: FormRow[]): IdentifiedRow[] =>
    rows.map((data) => ({ id: crypto.randomUUID(), data }));

export default function DynamicSchemaForm({ schema, initialRows = [{}], onSubmit, options = {} }: DynamicSchemaFormProps) {
    const [rows, setRows] = useState<IdentifiedRow[]>(toIdentifiedRows(initialRows.length ? initialRows : [{}]));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addRow = () => setRows((r) => [...r, { id: crypto.randomUUID(), data: {} }]);
    const removeRow = (id: string) => setRows((r) => (r.length === 1 ? r : r.filter((row) => row.id !== id)));

    const handleChange = (id: string, key: string, value: string | number | boolean | null | undefined) => {
        setRows((prev) => prev.map((row) => (row.id === id ? { ...row, data: { ...row.data, [key]: value } } : row)));
    };

    const validateRow = (row: FormRow) => {
        if (!schema) return true;
        const required: string[] = schema.required || [];
        for (const r of required) {
            const v = row[r];
            if (v === undefined || v === null || (typeof v === "string" && v.trim() === "")) return false;
        }
        return true;
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        setError(null);
        const invalidIndex = rows.findIndex((row) => !validateRow(row.data));
        if (invalidIndex !== -1) {
            setError(`Line ${invalidIndex + 1} is missing required fields`);
            return;
        }
        setLoading(true);
        try {
            await onSubmit(rows.map((row) => row.data));
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setLoading(false);
        }
    };

    const properties = schema?.properties ? Object.entries(schema.properties) : [];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {rows.map(({ id, data }, idx) => (
                <div key={id} className="app-panel grid gap-3 p-4">
                    <div className="grid grid-cols-12 gap-3">
                        {properties.map(([key, def]: [string, SchemaProperty]) => {
                            const title = def.title || key;
                            const required = (schema.required || []).includes(key);
                            const fieldType = def.type || "string";
                            const opts = options[key];
                            const value = (data[key] as string | number) ?? "";
                            let field: React.ReactNode;
                            if (opts) {
                                field = (
                                    <select className="app-input" value={value} onChange={(e) => handleChange(id, key, e.target.value ? Number(e.target.value) : null)}>
                                        <option value="">Select</option>
                                        {opts.map((o) => (<option key={o.value} value={o.value}>{o.label}</option>))}
                                    </select>
                                );
                            } else if (fieldType === "integer" || fieldType === "number") {
                                field = <input type="number" className="app-input" value={value} onChange={(e) => handleChange(id, key, e.target.value === "" ? undefined : Number(e.target.value))} />;
                            } else if (fieldType === "boolean") {
                                field = <input type="checkbox" className="h-4 w-4 rounded border border-border bg-input text-primary" checked={Boolean(data[key])} onChange={(e) => handleChange(id, key, e.target.checked)} />;
                            } else {
                                field = <input type="text" className="app-input" value={value} onChange={(e) => handleChange(id, key, e.target.value)} />;
                            }
                            return (
                                <label key={key} className="col-span-12 text-sm text-foreground sm:col-span-6">
                                    <span className="mb-1 block font-medium">{title}{required ? " *" : ""}</span>
                                    {field}
                                </label>
                            );
                        })}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <p>Line {idx + 1}</p>
                        {rows.length > 1 && <button type="button" className="text-destructive hover:underline" onClick={() => removeRow(id)}>Remove</button>}
                    </div>
                </div>
            ))}

            {error && <p className="text-sm text-red-600">{error}</p>}

            <div className="flex gap-3">
                <button type="button" className="app-button-secondary" onClick={addRow}>Add another line</button>
                <button type="submit" className="ml-auto inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>{loading ? "Preparing..." : "Bulk create"}</button>
            </div>
        </form>
    );
}
