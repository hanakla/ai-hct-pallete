import { serialize, deserialize } from "superjson";
import { Message } from "../../types";

type PayloadOf<Kind> = {
  [K in Message["kind"]]-?: K extends Kind ? Message["payload"] : never;
}[Message["kind"]];

export const postMessage = async <K extends Message["kind"]>(
  kind: K,
  payload: PayloadOf<K>
) => {
  const result = await new Promise<any>((r) => {
    new CSInterface().evalScript(
      `postMessage(${JSON.stringify({ kind: kind, payload })})`,
      r
    );
  });

  try {
    const val = JSON.parse(result);
    // console.log(`Result(${kind})`, val);
    return val;
  } catch (e) {
    console.error("postMessage:", kind, result);
  }
};
