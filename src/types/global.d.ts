export {};

declare global {
    interface Window {
        electronAPI: {
            onCSVOpened: (callback: (data: string) => void) => () => void;
        }
    }
}
