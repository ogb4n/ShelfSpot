"use client";
import { useSession } from "next-auth/react";
import Link from "next/link";

export default function UserChip() {
    const { data: session } = useSession();
    if (!session?.user?.name) return null;
    return (
        <Link href="/settings">
            <span
                className="ml-2 px-3 py-1 rounded-full theme-sidebar text-sm font-medium cursor-pointer hover:theme-primary transition-colors border border-primary shadow"
                title="Paramètres utilisateur"
            >
                {session.user.name}
            </span>
        </Link>
    );
}
