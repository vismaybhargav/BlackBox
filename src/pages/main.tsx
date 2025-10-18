import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";

export default function MainPage() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-foreground">
            <header className="flex items-center justify-end gap-2 border-b bg-background/80 px-6 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <ModeToggle />
            </header>
            <main className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-12 text-center">
                <div className="space-y-2">
                    <h1 className="text-3xl font-semibold sm:text-4xl">Welcome to BlackBox</h1>
                    <p className="text-muted-foreground">
                        Toggle between light, dark, or system themes to preview the interface.
                    </p>
                </div>
                <Button onClick={() => { console.log("hello world") }}>
                    Button
                </Button>
            </main>
        </div>
    )
}
