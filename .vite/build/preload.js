"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  onCSVOpened: (callback) => {
    const channel = "csv-opened";
    const listener = (_event, data) => callback(data);
    electron.ipcRenderer.on(channel, listener);
    return () => {
      electron.ipcRenderer.off(channel, listener);
    };
  }
});
