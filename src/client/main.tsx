/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

import {} from "styled-components/cssprop";
import domready from "domready";
import {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import { render } from "react-dom";
import { Button } from "./components/Button";
import { themeManager } from "./themeManager";
// import JSON from "json5";
import { HCT } from "@material/material-color-utilities/dist/index";
import { createSlice, LysContext, useLysSliceRoot } from "@fleur/lys";
import { createGlobalStyle, css } from "styled-components";
import { postMessage } from "./infra/postMessage";
import { rgb } from "polished";
import copy from "copy-to-clipboard";

const fs = require("fs");
let csi: CSInterface;

domready(async () => {
  const script = document.createElement("script");
  script.src = "../libs/CSInterface.js";
  document.head.appendChild(script);

  await new Promise((r) => (script.onload = r));

  themeManager.init();
  csi = new CSInterface();

  const extPath =
    csi.getSystemPath(SystemPath.EXTENSION) + "/dist/host/hostscript.js";

  const result = await new Promise((r) =>
    csi.evalScript(`$.evalFile("${extPath}")`, r)
  );
  console.log("hostscript reloaded:", { result });

  render(
    <LysContext>
      <App key={Date.now()} />
    </LysContext>,
    document.querySelector("#root")!
  );
});

const Styles = createGlobalStyle`
  *, *::before, *::after {
    box-sizing: border-box;
  }


  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-size: 10px;
  }

  .colorBoxes {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 4px;
  }

  .inputlist {
    display: grid;
    gap: 4px;
  }

  .inputContainer {
    display: grid;
    gap: 4px 8px;
    align-items: center;
    justify-content: center;
    grid-template: "a b" / min-content 1fr;
  }

  .colorInput {
    width: 100%;
    height: 10px;
    margin: 0;

    appearance: none;
    --webkit-touch-callout: none;
    outline:none;
    line-height: 1;

    &::-webkit-slider-thumb {
      width: 4px;
      height: 12px;
      appearance: none;
      border: 1px solid #fff;

      box-shadow: 0 0 2px #aaa;
    }
  }

  .example {
    width: 50px;
    height: 50px;
    margin-right: 4px;

    &::before {
      display: block;
      content: '';
      padding-top: 100%;
    }
  }
`;

const App = () => {
  const [{ color }, actions] = useLysSliceRoot(aiSlice);

  const hct = HCT.from(color.hue, color.chroma, color.tone);
  const rgbobj = useMemo(() => intToHex(hct.toInt()), [hct.toInt()]);
  const rgbString = useMemo(() => {
    return (
      rgbobj.red.toString(16).padStart(2, "0") +
      rgbobj.green.toString(16).padStart(2, "0") +
      rgbobj.blue.toString(16).padStart(2, "0")
    );
  }, [rgbobj]);

  const reload = useCallback(async () => {
    // const extPath =
    //   csi.getSystemPath(SystemPath.EXTENSION) + "/dist/host/hostscript.js";
    // const result = await new Promise((r) =>
    //   csi.evalScript(`$.evalFile("${extPath}")`, r)
    // );
    // console.log("reloaded:", extPath, { result });
  }, []);

  const handleChangeHue = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      console.log(currentTarget.valueAsNumber!);
      actions.set((draft) => (draft.color.hue = currentTarget.valueAsNumber!));
    },
    []
  );

  const handleChangeChroma = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      console.log(currentTarget.valueAsNumber!);
      actions.set(
        (draft) => (draft.color.chroma = currentTarget.valueAsNumber!)
      );
    },
    []
  );

  const handleChangeTone = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      console.log(currentTarget.valueAsNumber!);
      actions.set((draft) => (draft.color.tone = currentTarget.valueAsNumber!));
    },
    []
  );

  useEffect(() => {
    actions.fetchCurrentColor();
  }, []);

  useEffect(() => {
    csi.addEventListener("documentAfterActivate", function (event) {
      actions.fetchCurrentColor();
    });

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });

    // window.addEventListener("mousemove", (e) => {
    //   e.preventDefault();
    //   e.stopPropagation();
    // });
  });

  useEffect(() => {
    postMessage("update", rgbobj);
  }, [rgbobj]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        padding: "4px",
        display: "flex",
        flexFlow: "column",
      }}
    >
      <Styles />
      <div className="colorBoxes">
        <div>
          <div className="example" style={{ backgroundColor: rgb(rgbobj) }} />
          <span
            onClick={() => {
              copy(rgbString);
            }}
            style={{
              appearance: "none",
              background: "transparent",
              border: "none",
              color: "white",
            }}
          >
            #{rgbString}
          </span>
        </div>

        <div className="inputlist">
          <div className="inputContainer">
            H:
            <input
              className="colorInput"
              type="range"
              max="360"
              min="0"
              step="0.1"
              value={color.hue}
              onClick={(e) => e.preventDefault()}
              onChange={handleChangeHue}
              style={{
                backgroundImage: `
                linear-gradient(
                  to right,
                  rgb(255, 0, 0) 0%,
                  rgb(255, 255, 0) 17%,
                  rgb(0, 255, 0) 33%,
                  rgb(0, 255, 255) 50%,
                  rgb(0, 0, 255) 67%,
                  rgb(255, 0, 255) 83%,
                  rgb(255, 0, 0) 100%
                )
              `,
              }}
            />
          </div>
          <div className="inputContainer">
            C:
            <input
              className="colorInput"
              type="range"
              max="200"
              min="0"
              step="0.1"
              value={color.chroma}
              onClick={(e) => e.preventDefault()}
              onChange={handleChangeChroma}
              style={{
                background: `
              linear-gradient(
                to right,
                hsl(${color.hue}, 0%, 100%) 0%,
                hsl(${color.hue}, 100%, 50%) 100%
              )`,
              }}
            />
          </div>
          <div className="inputContainer">
            T:
            <input
              className="colorInput"
              type="range"
              max="100"
              min="0"
              step="0.1"
              value={color.tone}
              onClick={(e) => e.preventDefault()}
              onChange={handleChangeTone}
              style={{
                background: `
              linear-gradient(
                to right,
                hsl(${color.hue}, ${color.chroma * 100}%, 0%) 0%,
                hsl(${color.hue}, ${color.chroma * 100}%, 100%) 100%
              )`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="hostElt" style={{ marginTop: "8px" }}>
        <Button onClick={reload}>Reload</Button>
        {/* {mode === "index" ? (
          <Button onClick={onClickCreateVariant}>Create variant</Button>
        ) : (
          <Button onClick={onClickFinishVariant}>Finish variant</Button>
        )} */}

        <Button
          onClick={() => {
            actions.fetchCurrentColor();
          }}
        >
          test
        </Button>
      </div>
    </div>
  );
};

// const Row = ({ index, style }: any) => {
//   const [state] = useLysSlice(aiSlice);
//   const layer = state.layers[index];

//   return <div style={style}>{JSON.stringify(layer)}</div>;
// };

interface State {
  color: { hue: number; chroma: number; tone: number };
}

const aiSlice = createSlice(
  {
    actions: {
      async fetchCurrentColor({ commit }) {
        const { result, ...colors } = await postMessage("fetchColor", {});
        console.log(result, colors);
        // if (!result.result) return;
        // commit({ color: colors });
      },
    },
    computed: {},
  },
  (): State => ({
    color: { hue: 0, chroma: 100, tone: 50 },
    // tab: "index",
    // mode: "index",
    // variantPatch: null,
    // document: null,
    // layers: [],
  })
);

const intToHex = (num: number) => {
  const str = ("000000" + (num >>> 0).toString(16)).slice(-6);
  return {
    red: parseInt(str.slice(0, 2), 16),
    green: parseInt(str.slice(2, 4), 16),
    blue: parseInt(str.slice(4, 8), 16),
  };
};
