import { useTheme } from "next-themes";

interface PageTitleProps {
    title: string;
    className?: string;
}

export function PageTitle({ title, className }: PageTitleProps) {
    const { theme } = useTheme();

    return (
        <h1 className={`text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r ${theme === 'light'
                ? "from-[#500000] via-[#800020] to-[#500000]"
                : "from-amber-200 via-yellow-400 to-amber-500"
            } ${className || ""}`}>
            {title}
        </h1>
    );
}
