"use client";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useEffect, useState, useRef } from "react";
import useGetTags from "@/app/hooks/useGetTags";
import { MoreVertical, CheckSquare, Square, Trash2 } from "lucide-react";
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
    onCreate?: () => void;
    showCreateForm?: boolean;
    children?: React.ReactNode;
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
], onCreate, showCreateForm, children }: ItemsTableProps) {
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
    const [searchInput, setSearchInput] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchInput);
        }, 300); // 300ms de délai
        return () => clearTimeout(handler);
    }, [searchInput]);

    const filteredItems = (debouncedSearch || search)
        ? items.filter((item) => {
            const searchValue = (debouncedSearch || search || "").toLowerCase();
            const nameMatch = item.name?.toLowerCase().includes(searchValue);
            const tagsMatch = Array.isArray(item.tags) && item.tags.some(tag => tag.toLowerCase().includes(searchValue));
            return nameMatch || tagsMatch;
        })
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
            } catch { }
        }
        fetchFavourites();
    }, []);

    // Handler pour supprimer plusieurs objets
    const handleDeleteSelected = async () => {
        if (selectedIds.length === 0) return;
        if (!window.confirm(`Supprimer ${selectedIds.length} objet(s) sélectionné(s) ?`)) return;
        if (!window.confirm(`Êtes-vous vraiment sûr de vouloir supprimer définitivement ${selectedIds.length} objet(s) ? Cette action est irréversible.`)) return;
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
                {selectedIds.length > 0 && (
                    <Button
                        size="sm"
                        variant="ghost"
                        className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                        onClick={handleDeleteSelected}
                        aria-label="Supprimer la sélection"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                )}
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="theme-input rounded px-2 py-1 ml-2 w-56"
                    value={searchInput}
                    onChange={e => {
                        setSearchInput(e.target.value);
                        setPage(1);
                    }}
                />
                {onCreate && (
                    <Button size="sm" variant="default" className="ml-2" onClick={onCreate}>
                        {showCreateForm ? "Annuler" : "Créer un objet"}
                    </Button>
                )}
            </div>
            {/* Section déroulante pour le formulaire de création */}
            <div className={`transition-all duration-300 overflow-hidden ${showCreateForm ? 'max-h-[1000px] opacity-100 mb-4' : 'max-h-0 opacity-0 mb-0'}`}>
                {showCreateForm && children}
            </div>
            <div className="theme-card border theme-border p-1 max-h-[60vh] h-[55vh] overflow-y-auto overflow-x-auto text-sm">
                <Table>
                    <TableHeader>
                        <TableRow className="h-8">
                            <TableHead className="w-8 px-2">
                                <button onClick={toggleSelectAll} aria-label="Tout sélectionner">
                                    {allSelected ? <CheckSquare className="w-5 h-5 text-primary" /> : <Square className="w-5 h-5 text-muted-foreground" />}
                                </button>
                            </TableHead>
                            {columns.includes("name") && (
                                <TableHead>Nom</TableHead>
                            )}
                            {columns.includes("quantity") && (
                                <TableHead>Quantité</TableHead>
                            )}
                            {columns.includes("status") && (
                                <TableHead>Statut</TableHead>
                            )}
                            {columns.includes("room") && (
                                <TableHead>Pièce</TableHead>
                            )}
                            {columns.includes("place") && (
                                <TableHead>Emplacement</TableHead>
                            )}
                            {columns.includes("container") && (
                                <TableHead>Contenant</TableHead>
                            )}
                            {columns.includes("tags") && (
                                <TableHead>Tags</TableHead>
                            )}
                            {columns.includes("actions") && (
                                <TableHead>Actions</TableHead>
                            )}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedItems.map((item: Item, idx: number) => (
                            <TableRow key={item.id} className={idx % 2 === 0 ? "theme-bg h-8" : "bg-muted/50 h-8"}>
                                <TableCell className="w-8 px-2 py-1">
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
                                                    className="theme-input rounded px-2 py-1 w-full"
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
                                                    className="theme-input rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("status") && (
                                            <TableCell>
                                                <input
                                                    name="status"
                                                    value={editValues.status || ""}
                                                    onChange={handleChange}
                                                    className="theme-input rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("room") && (
                                            <TableCell>
                                                <input
                                                    name="room"
                                                    value={editValues.room?.name || ""}
                                                    onChange={handleChange}
                                                    className="theme-input rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("place") && (
                                            <TableCell>
                                                <input
                                                    name="place"
                                                    value={editValues.place?.name || ""}
                                                    onChange={handleChange}
                                                    className="theme-input rounded px-2 py-1 w-full"
                                                />
                                            </TableCell>
                                        )}
                                        {columns.includes("container") && (
                                            <TableCell>
                                                <input
                                                    name="container"
                                                    value={editValues.container?.name || ""}
                                                    onChange={handleChange}
                                                    className="theme-input rounded px-2 py-1 w-full"
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
                                                                    className={`px-2 py-1 rounded text-xs border ${selected ? "theme-accent border-accent" : "theme-muted border-muted"}`}
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
                                                <div className="flex gap-1">
                                                    <Button size="sm" variant="secondary" onClick={handleSave}>
                                                        Enregistrer
                                                    </Button>
                                                    <Button size="sm" variant="ghost" onClick={handleCancel}>
                                                        Annuler
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        )}
                                    </>
                                ) : (
                                    <>
                                        {columns.includes("name") && <TableCell className="py-1">{item.name}</TableCell>}
                                        {columns.includes("quantity") && <TableCell className="py-1">{item.quantity}</TableCell>}
                                        {columns.includes("status") && <TableCell className="py-1">{item.status}</TableCell>}
                                        {columns.includes("room") && <TableCell className="py-1">{item.room?.name}</TableCell>}
                                        {columns.includes("place") && <TableCell className="py-1">{item.place?.name}</TableCell>}
                                        {columns.includes("container") && <TableCell className="py-1">{item.container?.name}</TableCell>}
                                        {columns.includes("tags") && <TableCell className="py-1">
                                            <div className="flex flex-wrap gap-1">
                                                {item.tags && item.tags.length > 0 ? (
                                                    (item.tags as string[]).map((tagName: string) => {
                                                        const tagObj = allTags.find((t: Tag) => t.name === tagName) as Tag | undefined;
                                                        return (
                                                            <span
                                                                key={tagName}
                                                                className="px-2 py-1 rounded text-xs border theme-accent border-accent flex items-center gap-1"
                                                            >
                                                                {tagObj?.icon ? <span>{tagObj.icon}</span> : null}{tagName}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="theme-muted text-xs">Aucun tag</span>
                                                )}
                                            </div>
                                        </TableCell>}
                                        {columns.includes("actions") && (
                                            <TableCell className="relative py-1">
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
                        className="theme-input rounded px-2 py-1"
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
