"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserChip() {
    const { data: session } = useSession();
    if (!session?.user?.name) return null;
    return (
        <Link href="/settings">
            <span
                className="ml-2 px-3 py-1 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium cursor-pointer hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors border border-blue-300 dark:border-blue-700 shadow"
                title="Paramètres utilisateur"
            >
                {session.user.name}
            </span>
        </Link>
    );
}
