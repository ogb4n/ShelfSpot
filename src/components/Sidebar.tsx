"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Home, Box, Star, Settings, Package, Warehouse } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import UserChip from "@/components/UserChip";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import { Dock, DockIcon } from "@/components/magicui/dock";
import CreateObjectModal from "@/components/CreateObjectModal";

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
    const [showCreate, setShowCreate] = useState(false);

    return (
        <>
            <CreateObjectModal open={showCreate} onClose={() => setShowCreate(false)} />
            {/* Desktop Sidebar */}
            <aside className="bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 fixed left-0 top-0 h-full w-[220px] flex-col z-40 hidden md:flex"
            >
                <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <span className="font-bold text-lg text-gray-900 dark:text-white">ShelfSpot</span>
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

                <div className="p-4">
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
