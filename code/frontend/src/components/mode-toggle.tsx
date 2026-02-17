import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ModeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Avoid hydration mismatch — only render after mount
    useEffect(() => setMounted(true), []);

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    if (!mounted) return null;

    return (
        <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 w-9 transition-colors cursor-pointer"
            aria-label="Toggle theme"
        >
            {theme === "dark" ? (
                <Sun className="h-[1.2rem] w-[1.2rem]" />
            ) : (
                <Moon className="h-[1.2rem] w-[1.2rem]" />
            )}
        </button>
    );
}
