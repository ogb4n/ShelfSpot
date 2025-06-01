"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Box, Star, Settings, Package, LogOut } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import UserChip from "@/components/UserChip";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import Image from "next/image";
import { Dock, DockIcon } from "@/components/magicui/dock";
import CreateObjectModal from "@/components/CreateObjectModal";

// Ajout du type Item pour la recherche
interface Item {
    id: number;
    name: string;
}

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/consumables", label: "Consumables", icon: Package },
    { href: "/favourites", label: "Favorites", icon: Star },
    { href: "/manage", label: "Manage", icon: Box },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreate, setShowCreate] = useState(false);
    const isMobile = typeof window !== "undefined" && window.innerWidth <= 768;

    useEffect(() => {
        if (!search) {
            setResults([]);
            return;
        }
        setLoading(true);
        const handler = setTimeout(async () => {
            try {
                const res = await fetch(`/api/items?search=${encodeURIComponent(search)}`);
                const data = await res.json();
                setResults(data);
            } catch {
                setResults([]);
            } finally {
                setLoading(false);
            }
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    return (
        <>
            <CreateObjectModal open={showCreate} onClose={() => setShowCreate(false)} />
            {/* Desktop Sidebar */}
            <aside className="glass-card theme-sidebar border-r theme-border fixed left-0 top-0 h-full w-[220px] flex-col z-40 overflow-hidden rounded-r-2xl shadow-lg border-white/20 backdrop-blur-md bg-white/10 dark:bg-black/20 hidden md:flex"
                style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)", borderTopRightRadius: "1.25rem", borderBottomRightRadius: "1.25rem" }}
            >
                <div className="h-20 flex items-center justify-center font-bold text-xl gap-2">
                    {/* Removed app icon */}
                    ShelfSpot
                </div>
                {/* Search bar */}
                <div className="p-4 pb-0 relative">
                    <input
                        type="text"
                        placeholder="Search..."
                        className="theme-input rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <div className="absolute left-0 right-0 mt-1 theme-popover rounded shadow z-50 max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-2 text-sm theme-muted">Searching...</div>
                            ) : results.length === 0 ? (
                                <div className="p-2 text-sm theme-muted">No results</div>
                            ) : (
                                results.map((item: Item) => (
                                    <div
                                        key={item.id}
                                        className="p-2 cursor-pointer theme-accent hover:theme-primary text-sm"
                                        onClick={() => router.push(`/manage/${item.id}`)}
                                    >
                                        {item.name}
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
                <nav className="flex-1 flex flex-col gap-2 p-4 pt-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-2 rounded-md transition-all font-medium hover:theme-sidebar-accent hover:shadow-md hover:translate-x-1 hover:scale-[1.03] duration-150",
                                pathname === href && "theme-sidebar-primary"
                            )}
                        >
                            <Icon className="w-5 h-5" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="px-4 mb-2">
                    <button
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-semibold shadow transition mb-2"
                        onClick={() => setShowCreate(true)}
                    >
                        + Create
                    </button>
                </div>
                <div className="p-4 flex justify-between items-center gap-2">
                    <div className="flex items-center gap-2">
                        <UserChip />
                        <ThemeSwitcher />
                        <button
                            aria-label="Paramètres"
                            onClick={() => router.push('/settings')}
                            className="p-1 rounded hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </aside>
            {/* Mobile Dock */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden flex justify-center pointer-events-none">
                <Dock className="pointer-events-auto">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <DockIcon key={href}>
                            <button
                                aria-label={label}
                                onClick={() => router.push(href)}
                                className={cn(
                                    "flex flex-col items-center justify-center gap-1 text-xs text-zinc-700 dark:text-zinc-200 px-2 py-1 focus:outline-none",
                                    pathname === href && "text-primary"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                            </button>
                        </DockIcon>
                    ))}
                    <DockIcon>
                        <ThemeSwitcher />
                    </DockIcon>
                </Dock>
            </nav>
        </>
    );
}
