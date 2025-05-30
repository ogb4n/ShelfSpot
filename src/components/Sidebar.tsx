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

// Ajout du type Item pour la recherche
interface Item {
    id: number;
    name: string;
}

const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: Home },
    { href: "/consumables", label: "Consommables", icon: Package },
    { href: "/favourites", label: "Favoris", icon: Star },
    { href: "/manage", label: "Gestion", icon: Box },
    { href: "/settings", label: "Paramètres", icon: Settings },
];

export default function Sidebar() {
    const pathname = usePathname();
    const router = useRouter();
    const [search, setSearch] = useState("");
    const [results, setResults] = useState<Item[]>([]);
    const [loading, setLoading] = useState(false);

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
        <aside className="theme-sidebar border-r theme-border fixed left-0 top-0 h-full w-[220px] flex flex-col z-40">
            <div className="h-20 flex items-center justify-center font-bold text-xl border-b theme-border gap-2">
                <Image src="/app-ico.svg" alt="ShelfSpot logo" width={48} height={48} className="w-12 h-12 dark:invert" />
                ShelfSpot
            </div>
            {/* Barre de recherche */}
            <div className="p-4 pb-0 relative">
                <input
                    type="text"
                    placeholder="Rechercher..."
                    className="theme-input rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-primary"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                {search && (
                    <div className="absolute left-0 right-0 mt-1 theme-popover rounded shadow z-50 max-h-60 overflow-y-auto">
                        {loading ? (
                            <div className="p-2 text-sm theme-muted">Recherche...</div>
                        ) : results.length === 0 ? (
                            <div className="p-2 text-sm theme-muted">Aucun résultat</div>
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
            <div className="p-4 border-t theme-border flex justify-between items-center gap-2">
                <div className="flex items-center gap-2">
                    <UserChip />
                    <ThemeSwitcher />
                </div>
                <button
                    onClick={() => signOut()}
                    className="p-2 rounded hover:bg-red-100 dark:hover:bg-red-900 text-red-600 dark:text-red-400 transition-colors"
                    title="Se déconnecter"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
        </aside>
    );
}
