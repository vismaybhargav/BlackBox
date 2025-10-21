import { ModeToggle } from "@/components/mode-toggle";
import {useEffect, useState} from "react";
import { parseCSV } from "@/lib/log-handle";

export default function MainPage() {
    const [rows, setRows] = useState<string[][]>([]);

    useEffect(() => {
        window.electronAPI.onCSVOpened((data) => {
            const parsed = parseCSV(data);
            setRows(parsed);
        })
    });

    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="flex items-center justify-end gap-2 border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ModeToggle />
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">

            </main>
        </div>
    )
}
