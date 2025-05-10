"use client";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import useGetTags from "@/app/hooks/useGetTags";
import { MoreVertical, CheckSquare, Square } from "lucide-react";
import { Menu } from "@headlessui/react";
import { useFloating, FloatingPortal, offset, flip, shift } from '@floating-ui/react';
import { Item, Tag } from "@/app/types";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export type ItemsTableColumn =
    | "name"
    | "quantity"
    | "status"
    | "room"
    | "place"
    | "container"
    | "tags"
    | "actions";

interface ItemsTableProps {
    search?: string;
    items?: Item[];
    columns?: ItemsTableColumn[];
}

function ItemsTable({ search, items: itemsProp, columns = [
    "name",
    "quantity",
    "status",
    "room",
    "place",
    "container",
    "tags",
    "actions",
] }: ItemsTableProps) {
    const [items, setItems] = useState<Item[]>(itemsProp || []);
    const [loading, setLoading] = useState(!itemsProp);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [editId, setEditId] = useState<number | null>(null);
    const [editValues, setEditValues] = useState<Partial<Item>>({});
    const inputRef = useRef<HTMLInputElement>(null);
    const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[1]);
    const { tags: allTags, loading: tagsLoading } = useGetTags();
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [favourites, setFavourites] = useState<number[]>([]);

    const filteredItems = search
        ? items.filter((item) =>
            item.name?.toLowerCase().includes(search.toLowerCase())
        )
        : items;
    const totalPages = Math.ceil(filteredItems.length / pageSize);
    const paginatedItems = filteredItems.slice((page - 1) * pageSize, page * pageSize);

    const allSelected = paginatedItems.length > 0 && paginatedItems.every(item => selectedIds.includes(item.id));
    const toggleSelectAll = () => {
        if (allSelected) setSelectedIds(selectedIds.filter(id => !paginatedItems.some(item => item.id === id)));
        else setSelectedIds([...selectedIds, ...paginatedItems.filter(item => !selectedIds.includes(item.id)).map(item => item.id)]);
    };
    const toggleSelect = (id: number) => {
        setSelectedIds(selectedIds.includes(id) ? selectedIds.filter(i => i !== id) : [...selectedIds, id]);
    };

    useEffect(() => {
        if (itemsProp) return;
        async function fetchItems() {
            try {
                const res = await fetch("/api/items");
                const data = await res.json();
                setItems(data);
            } catch {
                setError("Erreur lors du chargement des objets");
            } finally {
                setLoading(false);
            }
        }
        fetchItems();
    }, [itemsProp]);

    useEffect(() => {
        // Récupère les favoris de l'utilisateur au chargement
        async function fetchFavourites() {
            try {
                const res = await fetch("/api/favourites", { cache: "no-store" });
                const data = await res.json();
                if (Array.isArray(data)) {
                    setFavourites(data.map((fav: { itemId?: number; item?: { id: number } }) => fav.itemId || fav.item?.id).filter((id): id is number => typeof id === 'number'));
                }
            } catch {}
        }
        fetchFavourites();
    }, []);

    // Handler pour supprimer plusieurs objets
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Supprimer ${selectedIds.length} objet(s) sélectionné(s) ?`)) return;
        try {
            await Promise.all(selectedIds.map(id => fetch(`/api/items/delete?id=${id}`, { method: "DELETE" })));
            setItems((prev) => prev.filter((item) => !selectedIds.includes(item.id)));
            setSelectedIds([]);
        } catch {
            alert("Erreur lors de la suppression multiple");
        }
    };

    if (loading) return <div>Chargement...</div>;
    if (error) return <div>{error}</div>;

    const handleEdit = (item: Item) => {
        setEditId(item.id);
        setEditValues({ ...item });
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setEditValues({ ...editValues, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        await fetch("/api/items/edit", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editValues),
        });
        setItems((prev: Item[]) => prev.map((it: Item) => (it.id === editId ? { ...it, ...editValues } : it)));
        setEditId(null);
        setEditValues({});
    };

    const handleCancel = () => {
        setEditId(null);
        setEditValues({});
    };

    // Handler pour supprimer un objet
    const handleDelete = async (id: number) => {
        if (!window.confirm("Supprimer cet objet ?")) return;
        try {
            await fetch(`/api/items/delete?id=${id}`, { method: "DELETE" });
            setItems((prev) => prev.filter((item: Item) => item.id !== id));
        } catch {
            alert("Erreur lors de la suppression");
        }
    };

    function ActionMenu({ item, handleEdit, handleDelete, favourites, setFavourites }: {
        item: Item;
        handleEdit: (item: Item) => void;
        handleDelete: (id: number) => void;
        favourites: number[];
        setFavourites: React.Dispatch<React.SetStateAction<number[]>>;
    }) {
        const { refs, floatingStyles } = useFloating({
            placement: 'bottom-end',
            middleware: [offset(4), flip(), shift()]
        });
        return (
            <Menu as="div" className="inline-block text-left">
                {({ open }: { open: boolean }) => (
                    <>
                        <Menu.Button ref={refs.setReference} as="button" className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700">
                            <MoreVertical className="w-5 h-5" />
                        </Menu.Button>
                        {open && (
                            <FloatingPortal>
                                <Menu.Items
                                    ref={refs.setFloating}
                                    style={floatingStyles}
                                    className="rounded-md bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none border border-gray-200 dark:border-gray-700 flex flex-col p-1"
                                >
                                    <Menu.Item>
                                        {({ active }: { active: boolean }) => (
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm rounded ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                                onClick={() => handleEdit(item)}
                                            >
                                                Modifier
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }: { active: boolean }) => (
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm rounded ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                                onClick={() => {
                                                    if (typeof window !== 'undefined') {
                                                        window.location.href = `/manage/${item.id}`;
                                                    }
                                                }}
                                            >
                                                Page de l&apos;objet
                                            </button>
                                        )}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }: { active: boolean }) => {
                                            const isFav = favourites.includes(item.id);
                                            return (
                                                <button
                                                    className={`w-full text-left px-4 py-2 text-sm rounded ${active ? 'bg-gray-100 dark:bg-gray-700' : ''}`}
                                                    onClick={async () => {
                                                        const userName = (typeof window !== 'undefined' && localStorage.getItem('userName')) || undefined;
                                                        if (isFav) {
                                                            await fetch(`/api/favourites?id=${item.id}`, { method: 'DELETE' });
                                                            setFavourites((prev: number[]) => prev.filter((favId: number) => favId !== item.id));
                                                        } else {
                                                            await fetch('/api/favourites', {
                                                                method: 'POST',
                                                                headers: { 'Content-Type': 'application/json' },
                                                                body: JSON.stringify({ itemId: item.id, userName }),
                                                            });
                                                            setFavourites([...favourites, item.id]);
                                                        }
                                                    }}
                                                >
                                                    {isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                                                </button>
                                            );
                                        }}
                                    </Menu.Item>
                                    <Menu.Item>
                                        {({ active }: { active: boolean }) => (
                                            <button
                                                className={`w-full text-left px-4 py-2 text-sm rounded text-red-600 ${active ? 'bg-red-100 dark:bg-red-900' : ''}`}
                                                onClick={() => handleDelete(item.id)}
                                            >
                                                Supprimer l&apos;objet
                                            </button>
                                        )}
                                    </Menu.Item>
                                </Menu.Items>
                            </FloatingPortal>
                        )}
                    </>
                )}
            </Menu>
        );
    }

    return (
        <div>
            <div className="flex items-center mb-2 gap-2">
                <Button
                    size="sm"
                    variant="destructive"
                    disabled={selectedIds.length === 0}
                    onClick={handleDeleteSelected}
                >
                    Supprimer la sélection
                </Button>
            </div>
            <div className="bg-white dark:bg-black rounded-xl border border-[#bdbdbd] dark:border-[#444] p-2 overflow-x-auto max-h-[70vh] overflow-y-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-8 px-2">
                                <button onClick={toggleSelectAll} aria-label="Tout sélectionner">
                                    {allSelected ? <CheckSquare className="w-5 h-5 text-violet-500" /> : <Square className="w-5 h-5 text-gray-400" />}
                                </button>
                            </TableHead>
                            {columns.includes("name") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Nom</TableHead>
                            )}
                            {columns.includes("quantity") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Quantité</TableHead>
                            )}
                            {columns.includes("status") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Statut</TableHead>
                            )}
                            {columns.includes("room") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Pièce</TableHead>
                            )}
                            {columns.includes("place") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Emplacement</TableHead>
                            )}
                            {columns.includes("container") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Contenant</TableHead>
                            )}
                            {columns.includes("tags") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Tags</TableHead>
                            )}
                            {columns.includes("actions") && (
                                <TableHead className="font-semibold text-black dark:text-white bg-white dark:bg-black border-b border-[#bdbdbd] dark:border-[#444] px-4 py-2">Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.map((item: Item, idx: number) => (
                            <TableRow key={item.id} className={idx % 2 === 0 ? "bg-[#e0e0e0] dark:bg-[#292929]" : "bg-[#ededed] dark:bg-[#222]"}>
                                <TableCell className="w-8 px-2">
                                    <input
                                        type="checkbox"
                                        checked={selectedIds.includes(item.id)}
                                        onChange={() => toggleSelect(item.id)}
                                        aria-label="Sélectionner"
                                    />
                                </TableCell>
                                {editId === item.id ? (
                                    <>
                                        {columns.includes("name") && (
                                            <TableCell>
                                                <input
                                                    ref={inputRef}
                                                    name="name"
                                                    value={editValues.name}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("quantity") && (
                                            <TableCell>
                                                <input
                                                    name="quantity"
                                                    type="number"
                                                    value={editValues.quantity}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("status") && (
                                            <TableCell>
                                                <input
                                                    name="status"
                                                    value={editValues.status || ""}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("room") && (
                                            <TableCell>
                                                <input
                                                    name="room"
                                                    value={editValues.room?.name || ""}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("place") && (
                                            <TableCell>
                                                <input
                                                    name="place"
                                                    value={editValues.place?.name || ""}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("container") && (
                                            <TableCell>
                                                <input
                                                    name="container"
                                                    value={editValues.container?.name || ""}
                                                    onChange={handleChange}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("tags") && (
                                            <TableCell>
                                                {tagsLoading ? (
                                                    <span>Chargement des tags…</span>
                                                ) : (
                                                    <div className="flex flex-wrap gap-1">
                                                        {allTags.map((tag: Tag) => {
                                                            const selected = editValues.tags?.includes(tag.name);
                                                            return (
                                                                <button
                                                                    key={tag.id}
                                                                    type="button"
                                                                    className={`px-2 py-1 rounded text-xs border ${selected ? "bg-blue-600 text-white border-blue-600" : "bg-gray-100 border-gray-300 text-gray-800"}`}
                                                                    onClick={() => {
                                                                        setEditValues((prev: Partial<Item>) => {
                                                                            const prevTags = prev.tags || [];
                                                                            return {
                                                                                ...prev,
                                                                                tags: selected
                                                                                    ? prevTags.filter((t: string) => t !== tag.name)
                                                                                    : [...prevTags, tag.name],
                                                                            };
                                                                        });
                                                                    }}
                                                                >
                                                                    {tag.icon ? <span className="mr-1">{tag.icon}</span> : null}{tag.name}
                                                                </button>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </TableCell>
                                        )}
                                        {columns.includes("actions") && (
                                            <TableCell>
                                                <Button size="sm" variant="outline" onClick={handleSave}>
                                                    Enregistrer
                                                </Button>
                                                <Button size="sm" variant="ghost" onClick={handleCancel}>
                                                    Annuler
                                                </Button>
                                            </TableCell>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {columns.includes("name") && <TableCell>{item.name}</TableCell>}
                                        {columns.includes("quantity") && <TableCell>{item.quantity}</TableCell>}
                                        {columns.includes("status") && <TableCell>{item.status}</TableCell>}
                                        {columns.includes("room") && <TableCell>{item.room?.name}</TableCell>}
                                        {columns.includes("place") && <TableCell>{item.place?.name}</TableCell>}
                                        {columns.includes("container") && <TableCell>{item.container?.name}</TableCell>}
                                        {columns.includes("tags") && <TableCell>
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags && item.tags.length > 0 ? (
                                                    (item.tags as string[]).map((tagName: string) => {
                                                        const tagObj = allTags.find((t: Tag) => t.name === tagName) as Tag | undefined;
                                                        return (
                                                            <span
                                                                key={tagName}
                                                                className="px-2 py-1 rounded text-xs border bg-blue-100 text-blue-800 border-blue-200 flex items-center gap-1"
                                                            >
                                                                {tagObj?.icon ? <span>{tagObj.icon}</span> : null}{tagName}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-gray-400 text-xs">Aucun tag</span>
                                                )}
                                            </div>
                                        </TableCell>}
                                        {columns.includes("actions") && (
                                            <TableCell className="relative">
                                                <ActionMenu
                                                    item={item}
                                                    handleEdit={handleEdit}
                                                    handleDelete={handleDelete}
                                                    favourites={favourites}
                                                    setFavourites={setFavourites}
                                                />
                                            </TableCell>
                                        )}
                                    </>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
            <div className="flex justify-between items-center mt-4 gap-4">
                <div className="flex items-center gap-2">
                    <span>Afficher</span>
                    <select
                        className="border rounded px-2 py-1"
                        value={pageSize}
                        onChange={e => {
                            setPageSize(Number(e.target.value));
                            setPage(1);
                        }}
                    >
                        {PAGE_SIZE_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                    <span>lignes</span>
                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                        Précédent
                    </Button>
                    <span>Page {page} / {totalPages}</span>
                    <Button size="sm" variant="ghost" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                        Suivant
                    </Button>
                </div>
            </div>
        </div>
    );
}

export default ItemsTable;
