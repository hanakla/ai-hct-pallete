import { serialize, deserialize } from "superjson";

export const postMessage = async (kind: string, payload: any = {}) => {
  const result = await new Promise<any>((r) => {
    new CSInterface().evalScript(
      `postMessage(${JSON.stringify({ kind: kind, payload })})`,
      r
    );
  });

  try {
    return JSON.parse(result);
  } catch (e) {
    console.error("postMessage:", kind, result);
  }
};
