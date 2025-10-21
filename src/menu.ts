import { BrowserWindow, Menu, MenuItemConstructorOptions, dialog } from "electron";

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
                            properties: ["openFile"]
                        });

                        if (!canceled && filePaths.length) {
                            bw?.webContents.send("file-opened", filePaths[0]);
                        }
                    }
                }
            ]
        }
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}
