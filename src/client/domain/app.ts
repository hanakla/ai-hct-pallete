import { createSlice } from "@fleur/lys";
import { HCT } from "@material/material-color-utilities";
import { floor, isCloseTo } from "../utils/math";
import { postMessage } from "../infra/postMessage";
import { intToRgb } from "../utils/color";

interface State {
  enableSync: boolean;
  color: { hue: number; chroma: number; tone: number };
  prevIlstColor: { hue: number; chroma: number; tone: number };
}

export const aiSlice = createSlice(
  {
    actions: {
      async setColor({ commit }, fn: (color: State["color"]) => void) {
        commit(({ color }) => {
          fn(color);

          color.hue = floor(color.hue, 2);
          color.chroma = floor(color.chroma, 2);
          color.tone = floor(color.tone, 2);
        });
      },
      //   async fetchAiColor({ commit }) {
      //     const { result, color } = await postMessage("fetchColor", {});
      //     if (!result) return;

      //     const hct = HCT.fromInt(
      //       0xff000000 + (color.red << 16) + (color.green << 8) + color.blue
      //     );

      //     commit({ color: { hue: hct.hue, chroma: hct.chroma, tone: hct.tone } });
      //   },
      async pullAndUpdateColorIfChanged(
        { getState, commit },
        { force = false }: { force?: boolean } = {}
      ) {
        const { result, color } = await postMessage("fetchColor", {});
        if (!result) return;

        const nextColorHCT = HCT.fromInt(
          0xff000000 + (color.red << 16) + (color.green << 8) + color.blue
        );

        const { enableSync, prevIlstColor } = getState();

        if (
          force ||
          (enableSync &&
            (!isCloseTo(nextColorHCT.hue, prevIlstColor.hue, 1) ||
              !isCloseTo(nextColorHCT.chroma, prevIlstColor.chroma, 1) ||
              !isCloseTo(nextColorHCT.tone, prevIlstColor.tone, 1)))
        ) {
          commit(({ color, prevIlstColor }) => {
            prevIlstColor.hue = color.hue = floor(nextColorHCT.hue, 2);
            prevIlstColor.chroma = color.chroma = floor(nextColorHCT.chroma, 2);
            prevIlstColor.tone = color.tone = floor(nextColorHCT.tone, 2);
          });
        }
      },
      async pushLocalColor({ state }) {
        const { color: nextColor } = state;
        const hct = HCT.from(nextColor.hue, nextColor.chroma, nextColor.tone);
        const rgb = intToRgb(hct.toInt());

        await postMessage("update", { r: rgb.red, g: rgb.green, b: rgb.blue });
      },
    },
    computed: {
      hct: ({ color }) => HCT.from(color.hue, color.chroma, color.tone),
    },
  },
  (): State => ({
    prevIlstColor: { hue: 0, chroma: 100, tone: 50 },
    enableSync: true,
    color: { hue: 0, chroma: 100, tone: 50 },
    // tab: "index",
    // mode: "index",
    // variantPatch: null,
    // document: null,
    // layers: [],
  })
);
