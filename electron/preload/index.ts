import { contextBridge, ipcRenderer } from 'electron';

export interface BlockForgeBridge {
  prefabs: {
    list: () => Promise<string[]>;
    save: (name: string, data: unknown) => Promise<string>;
    load: (name: string) => Promise<unknown>;
    export: (name: string, data: unknown) => Promise<string | null>;
  };
}

const bridge: BlockForgeBridge = {
  prefabs: {
    list: () => ipcRenderer.invoke('prefabs:list'),
    save: (name, data) => ipcRenderer.invoke('prefabs:save', name, data),
    load: (name) => ipcRenderer.invoke('prefabs:load', name),
    export: (name, data) => ipcRenderer.invoke('prefabs:export', name, data)
  }
};

contextBridge.exposeInMainWorld('blockforge', bridge);
