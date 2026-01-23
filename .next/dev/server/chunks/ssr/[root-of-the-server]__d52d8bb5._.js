module.exports = [
"[externals]/crypto [external] (crypto, cjs, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[externals]/crypto [external] (crypto, cjs)");
    });
});
}),
"[project]/node_modules/https-proxy-agent/dist/index.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[root-of-the-server]__329dd231._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/https-proxy-agent/dist/index.js [app-ssr] (ecmascript)");
    });
});
}),
"[project]/node_modules/node-fetch/src/index.js [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_node-fetch_src_utils_multipart-parser_ccf1b3a8.js",
  "server/chunks/ssr/node_modules_5b356bfe._.js",
  "server/chunks/ssr/[externals]__561934d4._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/node-fetch/src/index.js [app-ssr] (ecmascript)");
    });
});
}),
"[externals]/@xenova/transformers [external] (@xenova/transformers, esm_import, [project]/node_modules/@xenova/transformers, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/[externals]_@xenova_transformers_e63ac654._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[externals]/@xenova/transformers [external] (@xenova/transformers, esm_import, [project]/node_modules/@xenova/transformers)");
    });
});
}),
];