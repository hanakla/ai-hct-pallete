/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, window, location, CSInterface, SystemPath, themeManager*/

import type {} from "styled-components/cssprop";
import "./css/styles.css";
import "./css/topcoat-desktop-dark.min.css";
import "regenerator-runtime";

import domready from "domready";
import { ChangeEvent, useCallback, useEffect, useMemo } from "react";
import { render } from "react-dom";
import { Button } from "./components/Button";
import { themeManager } from "./themeManager";
import { LysContext, useLysSliceRoot } from "@fleur/lys";
import { postMessage } from "./infra/postMessage";
import { rgb } from "polished";
import copy from "copy-to-clipboard";
// import { useChangedEffect } from "@hanakla/arma";
import styled, { createGlobalStyle, css } from "styled-components";
import { aiSlice } from "./domain/app";
import { floor } from "./utils/math";
import { intToRgb } from "./utils/color";

// const fs = globalThis.require("fs");
let csi: CSInterface;

domready(async () => {
  const script = document.createElement("script");
  script.src = "../libs/CSInterface.js";
  document.head.appendChild(script);

  const style = document.querySelector("[href='main.css']");
  style.id = "hostStyle";

  await new Promise((r) => (script.onload = r));

  themeManager.init();
  csi = new CSInterface();

  const extPath =
    csi.getSystemPath(SystemPath.EXTENSION) + "/dist/host/hostscript.js";

  const result = await new Promise((r) =>
    csi.evalScript(`$.evalFile("${extPath}")`, r)
  );

  setTimeout(async () => console.log("debug", await postMessage("debug", {})));
  console.log("hostscript reloaded:", { result });

  render(
    <LysContext>
      <App key={Date.now()} />
    </LysContext>,
    document.querySelector("#root")!
  );
});

const Styles = createGlobalStyle`
  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }

  html,
  body {
    width: 100%;
    height: 100%;
    border: 0px;
    margin: 0px;
    padding: 0px !important;
    overflow-x: hidden;
  }
`;

const App = () => {
  const [{ color, hct }, actions] = useLysSliceRoot(aiSlice);

  const rgbobj = useMemo(() => intToRgb(hct.toInt()), [hct.toInt()]);
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
      actions.setColor((color) => {
        const deg = currentTarget.valueAsNumber! % 360;
        color.hue = floor(deg < 0 ? deg + 360 : deg, 2);
      });
    },
    []
  );

  const handleChangeChroma = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      actions.setColor(
        (color) => (color.chroma = floor(currentTarget.valueAsNumber!, 2))
      );
    },
    []
  );

  const handleChangeTone = useCallback(
    ({ currentTarget }: ChangeEvent<HTMLInputElement>) => {
      actions.setColor(
        (color) => (color.tone = floor(currentTarget.valueAsNumber!, 2))
      );
    },
    []
  );

  const handleBarMouseDown = useCallback(() => {
    actions.set({ enableSync: false });
  }, []);

  const handleBarMouseUp = useCallback(async () => {
    await actions.set({ enableSync: true });
    await actions.pushLocalColor();
  }, []);

  useEffect(() => {
    window.addEventListener("mouseup", handleBarMouseUp);
  }, []);

  useEffect(() => {
    csi.addEventListener("documentAfterActivate", function (event) {
      actions.pullAndUpdateColorIfChanged();
    });

    window.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    });
  }, []);

  useEffect(() => {
    const id = window.setInterval(
      () => actions.pullAndUpdateColorIfChanged(),
      100
    );
    return () => window.clearInterval(id);
  }, [actions]);

  return (
    <div
      css={`
        display: flex;
        flex-flow: column;
        width: 100%;
        height: 100%;
        padding: 4px;
      `}
      className="hostElt"
    >
      <Styles />
      <div
        css={css`
          display: grid;
          grid-template-columns: max-content 1fr;
          gap: 4px;
        `}
      >
        <div>
          <div
            css={`
              width: 30px;
              height: 30px;
              margin-right: 4px;
            `}
            style={{ backgroundColor: rgb(rgbobj) }}
          />
          <Button
            css={`
              margin-top: 4px;
            `}
            onClick={() => {
              actions.pullAndUpdateColorIfChanged({ force: true });
            }}
          >
            sync
          </Button>
        </div>

        <div
          css={`
            display: grid;
            gap: 2px;
            margin-right: 16px;
          `}
        >
          <ColorBarContainer>
            <span>H:</span>
            <ColorRange
              type="range"
              max="360"
              min="0"
              step="0.1"
              value={color.hue}
              onMouseDown={handleBarMouseDown}
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
            <ColorNumericInput
              css={`
                padding: 0 4px;
                line-height: 1;
              `}
              type="number"
              className="topcoat-text-input"
              value={color.hue}
              onChange={handleChangeHue}
              step="0.1"
            />
          </ColorBarContainer>
          <ColorBarContainer>
            <span>C:</span>
            <ColorRange
              type="range"
              max="200"
              min="0"
              step="0.1"
              value={color.chroma}
              onMouseDown={handleBarMouseDown}
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
            <ColorNumericInput
              type="number"
              className="topcoat-text-input"
              value={color.chroma}
              onChange={handleChangeChroma}
              step="0.1"
            />
          </ColorBarContainer>
          <ColorBarContainer>
            <span>T:</span>
            <ColorRange
              type="range"
              max="100"
              min="0"
              step="0.1"
              value={color.tone}
              onMouseDown={handleBarMouseDown}
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
            <ColorNumericInput
              type="number"
              className="topcoat-text-input"
              value={color.tone}
              onChange={handleChangeTone}
              step="0.1"
            />
          </ColorBarContainer>

          <div
            css={`
              margin: 3px 0;
              margin-left: auto;
            `}
            onClick={() => {
              copy(rgbString);
            }}
          >
            #
            <input
              className="topcoat-text-input"
              css={`
                width: 60px;
                padding: 0px 4px;
                appearance: none;
                line-height: 1;
                /* background: white; */
                /* border: none; */
                /* color: white; */
              `}
              readOnly
              value={rgbString}
            />
          </div>
        </div>
      </div>

      {/* <div
        css={`
          padding: 0 4px;
        `}
      >
        <Button onClick={handleClickSync}>Sync</Button>
      </div> */}

      {false && (
        <div style={{ marginTop: "8px" }}>
          <Button onClick={reload}>Reload</Button>
          {/* {mode === "index" ? (
          <Button onClick={onClickCreateVariant}>Create variant</Button>
        ) : (
          <Button onClick={onClickFinishVariant}>Finish variant</Button>
        )} */}
        </div>
      )}
    </div>
  );
};

// const Row = ({ index, style }: any) => {
//   const [state] = useLysSlice(aiSlice);
//   const layer = state.layers[index];

//   return <div style={style}>{JSON.stringify(layer)}</div>;
// };

const ColorBarContainer = styled.div`
  display: grid;
  gap: 4px 8px;
  align-items: center;
  justify-content: center;
  grid-template: "a b c" / min-content 1fr 4em;
`;

const ColorRange = styled.input`
  width: 100%;
  height: 6px;
  margin: 0;

  appearance: none;
  --webkit-touch-callout: none;
  outline: none;
  line-height: 1;

  &::-webkit-slider-thumb {
    width: 4px;
    height: 12px;
    appearance: none;
    background: #fff;

    box-shadow: 0 0 2px #aaa;
  }
`;

const ColorNumericInput = styled.input`
  padding: 0 4px;
  text-align: right;

  &::-webkit-inner-spin-button,
  &::-webkit-outer-spin-button {
    -webkit-appearance: none;
    /* width: 5px; */
    /* background-color: #fff; */
    margin: 0;
  }
`;
