import { BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from "electron";
import * as fs from "node:fs";

export function installAppMenu(win?: BrowserWindow) {
    const isMac = process.platform === 'darwin';
    const getWin = () => win ?? BrowserWindow.getFocusedWindow() ?? undefined;

    const template: MenuItemConstructorOptions[] = [
        ...(isMac ? [{role: "appMenu" as const}] : []),
        {
            label: "File",
            submenu: [
                {
                    label: "Open...",
                    accelerator: "CmdOrCtrl+O",
                    click: async () => {
                        const bw = getWin();

                        const { canceled, filePaths } = await dialog.showOpenDialog(bw, {
                            properties: ["openFile"],
                            filters: [{
                                name: "CSV Files",
                                extensions: ["csv"]
                            }]
                        });

                        if(canceled || !filePaths.length) return;

                        win.webContents.send("csv-opened", fs.readFileSync(filePaths[0], "utf-8"));
                    }
                }
            ]
        },
        {
            label: "Tools",
            submenu: [
                {
                    label: "Toggle DevTools",
                    accelerator: isMac ? "Alt+Command+I" : "Ctrl+Shift+I",
                    click: () => {
                        const bw = getWin();
                        bw?.webContents.toggleDevTools();
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
