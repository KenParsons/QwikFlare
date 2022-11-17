"use strict";
exports.__esModule = true;
var vite_1 = require("vite");
var optimizer_1 = require("@builder.io/qwik/optimizer");
var vite_2 = require("@builder.io/qwik-city/vite");
var vite_tsconfig_paths_1 = require("vite-tsconfig-paths");
exports["default"] = (0, vite_1.defineConfig)(function () {
    return {
        ssr: { target: "webworker", noExternal: true },
        plugins: [(0, vite_2.qwikCity)(), (0, optimizer_1.qwikVite)(), (0, vite_tsconfig_paths_1["default"])()]
    };
});
