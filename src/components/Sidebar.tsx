"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Box, Star, Settings, Package, LogOut, Warehouse } from "lucide-react";
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
    { href: "/inventory", label: "Inventory", icon: Warehouse },
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
            <aside className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full w-[220px] flex-col z-40 hidden md:flex"
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">ShelfSpot</span>
                </div>
                {/* Search bar */}
                <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <input
                        type="text"
                        placeholder="Search items..."
                        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                    {search && (
                        <div className="absolute left-3 right-3 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                            {loading ? (
                                <div className="p-3 text-sm text-gray-500 dark:text-gray-400">Searching...</div>
                            ) : results.length === 0 ? (
                                <div className="p-3 text-sm text-gray-500 dark:text-gray-400">No results</div>
                            ) : (
                                results.map((item: Item) => (
                                    <div
                                        key={item.id}
                                        className="p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 text-sm border-b border-gray-100 dark:border-gray-700 last:border-0"
                                        onClick={() => router.push(`/manage/${item.id}`)}
                                    >
                                        <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                            Item in inventory
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>

                <nav className="flex-1 flex flex-col py-2">
                    {navLinks.map(({ href, label, icon: Icon }) => (
                        <Link
                            key={href}
                            href={href}
                            className={cn(
                                "flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 border-l-4 border-transparent",
                                pathname === href && "bg-blue-50 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 border-blue-600 dark:border-blue-400"
                            )}
                        >
                            <Icon className="w-4 h-4" />
                            {label}
                        </Link>
                    ))}
                </nav>

                <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                    <button
                        className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors"
                        onClick={() => setShowCreate(true)}
                    >
                        + Create New
                    </button>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
                    <UserChip />
                    <div className="flex items-center gap-1">
                        <ThemeSwitcher />
                        <button
                            aria-label="Settings"
                            onClick={() => router.push('/settings')}
                            className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Settings className="w-4 h-4" />
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
