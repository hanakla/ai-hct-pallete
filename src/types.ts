export type Message =
  | { kind: "debug"; payload: {} }
  | {
      kind: "update";
      payload: { r: number; g: number; b: number };
    }
  | { kind: "fetchColor"; payload: {} };
