export type Cell = [number, number, number] | null;

/** Mutable ref updated every frame by BuildInteraction, read by TargetHighlight. Avoids a store write per frame. */
export const targetedCellRef: { current: Cell } = { current: null };
