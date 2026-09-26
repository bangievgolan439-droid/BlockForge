import type { BlockForgeBridge } from '../../../electron/preload/index';

declare global {
  interface Window {
    blockforge: BlockForgeBridge;
  }
}

export {};
