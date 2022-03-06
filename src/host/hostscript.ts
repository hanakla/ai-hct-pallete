/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50 */
/*global $, Folder*/

import "extendscript-es5-shim-ts";
import "es6-string-polyfills";
import "./lib/polyfill";

$.global.postMessage = (msg: any) => {
  const { kind, payload } = msg;

  switch (kind) {
    case "fetchColor": {
      try {
        // app.activeDocument;
      } catch (e) {
        return JSON.stringify({ result: false });
      }

      // alert(Object.keys(app.activeDocument.defaultFillColor));
      return JSON.stringify({ result: false });
      // return JSON.stringify({
      //   result: true,
      //   fill: app.activeDocument.defaultFillColor,
      //   stroke: app.activeDocument.defaultStrokeColor,
      // });
    }
    case "update": {
      // app.activeDocument.defaultFillColor = {}
      return JSON.stringify({});
    }
  }
};
