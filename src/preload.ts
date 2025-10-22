// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld("electronAPI", {
    onCSVOpened: (callback: (data: string) => void) => {
        const channel = "csv-opened";
        const listener = (_event: Electron.IpcRendererEvent, data: string) => callback(data);

        ipcRenderer.on(channel, listener);

        return () => {
            ipcRenderer.off(channel, listener);
        };
    },
});
