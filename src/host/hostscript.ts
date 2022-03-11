/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

/// <reference path="./types.d.ts" />
import "extendscript-es5-shim-ts";
import "es6-string-polyfills";
import "./lib/polyfill";
// import "superjson";
// import "object.assign";
import { objectKeys } from "./poly";
import type { Message } from "../types";

const ensureElement = (check: () => void) => {
  return (f: () => void = () => {}) => {
    try {
      check();
      f();

      return true;
    } catch (e) {
      return false;
    }
  };
};

$.global.postMessage = (msg: Message) => {
  const { kind, payload } = msg;

  switch (kind) {
    case "debug": {
      return JSON.stringify([
        // app.activeDocument.defaultFillColor.typename,
        // objectKeys(
        //   // (app.activeDocument.defaultFillColor as GradientColor).gradient.gradientStops.
        //   app.activeDocument.defaultFillColor
        // ),
        // objectKeys(app.activeDocument.gradients[0]),
        // app.activeDocument.defaultFillColor.typename,
        // app.activeDocument.defaultFillColor instanceof GradientColor,
        // objectKeys(app.activeDocument.defaultFillOverprint),
        // app.activeDocument.
        // app.activeDocument.defaultFillColor.typename,
        filterPrimitives(app.activeDocument.defaultFillColor, /parent/),
        filterPrimitives(
          app.activeDocument.defaultFillColor.gradient?.gradientStops,
          /parent/
        ),
      ]);

      // app.activeDocument.brushes[0].

      // new RGBColor();
      // // new Color
      // new GrayColor();
      // new GradientColor().gradient.gradientStops[0].color;
    }
    case "fetchColor": {
      const failResult = JSON.stringify({ result: false });

      if (!ensureElement(() => app.activeDocument)()) return failResult;

      // if (isGradient(app.activeDocument.defaultFillColor))
      //   return JSON.stringify({ result: false });

      const source = app.isFillActive()
        ? app.activeDocument.defaultFillColor
        : app.activeDocument.defaultStrokeColor;
      if (!isProcessableColor(source)) return failResult;

      const c = toRGBColor(source);
      return JSON.stringify({
        result: true,
        color: { red: c.red, green: c.green, blue: c.blue },
      });
    }
    case "update": {
      const { r, g, b } = payload;

      ensureElement(() => app.activeDocument)(() => {
        const nextColor = new RGBColor();
        nextColor.red = r;
        nextColor.green = g;
        nextColor.blue = b;

        if (app.isFillActive()) {
          // if (isGradient(app.activeDocument.defaultFillColor)) return;
          app.activeDocument.defaultFillColor = nextColor;
        } else if (app.isStrokeActive()) {
          // if (isGradient(app.activeDocument.defaultStrokeColor)) return;
          app.activeDocument.defaultStrokeColor = nextColor;
        }
      });

      return JSON.stringify({});
    }
  }
};

const isProcessableColor = (color: any): color is RGBColor | GrayColor =>
  color instanceof RGBColor || color instanceof GrayColor;

const toRGBColor = (color: RGBColor | GrayColor) => {
  if (color instanceof RGBColor) {
    return { red: color.red, green: color.green, blue: color.blue };
  } else {
    const val = Math.round(255 * (color.gray / 100));
    return { red: val, green: val, blue: val };
  }
};

const filterPrimitives = (
  v: any,
  ignoreName: RegExp | null = null,
  refs = [v]
) => {
  const o = {};

  const type = typeof v;
  if (type === "function") {
    return "[Function]";
  } else if (type === "undefined") {
    return "undefined";
  } else if (v === null) {
    return v;
  } else if (type !== "object") {
    return v;
  }

  for (const k of objectKeys(v)) {
    try {
      if (ignoreName?.test(k)) {
        o[k] = "[[Ignored]]";
        continue;
      }

      if (refs.indexOf(v[k]) !== -1) {
        o[k] = "[loop]";
        continue;
      }

      if (!isPrimitive(v[k])) {
        refs.push(v[k]);
      }

      o[k] = filterPrimitives(v[k], ignoreName, refs);

      if ("length" in v[k] && typeof v[k] !== "string") {
        for (let i = 0, l = v[k].length; i < l; i++) {
          o[k][i] = filterPrimitives(v[k][i]);
        }
      }
    } catch (e) {
      o[k] = `[[Error ${e.message}]]`;
      continue;
    }
  }

  return o;
};

const isPrimitive = (v: any) => {
  const type = typeof v;
  return (
    v === null ||
    // type === "function" ||
    type === "number" ||
    type === "boolean" ||
    type === "string" ||
    type === "undefined"
  );
};

// const isGradient = (v: any) => v instanceof GradientColor;
