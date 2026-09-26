export type TargetedObject = { objectId: string } | null;

/** Mutable ref updated every frame by BuildInteraction, read by TargetHighlight. Avoids a store write per frame. */
export const targetedObjectRef: { current: TargetedObject } = { current: null };
