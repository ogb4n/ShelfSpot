"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export default function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<"light" | "dark">("light");

    useEffect(() => {
        setMounted(true);
        // Récupère le thème depuis localStorage ou media query
        let t = localStorage.theme;
        if (!t) {
            t = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        }
        setTheme(t);
    }, []);

    if (!mounted) return null; // Ne rien afficher tant que le thème n'est pas déterminé

    return (
        <button
            onClick={() => {
                const next = theme === "dark" ? "light" : "dark";
                setTheme(next);
                localStorage.theme = next;
                document.documentElement.classList.toggle("dark", next === "dark");
            }}
            className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle theme"
        >
            {theme === "dark"
                ? <Moon className="w-5 h-5 text-yellow-300" />
                : <Sun className="w-5 h-5 text-yellow-500" />}
        </button>
    );
}
