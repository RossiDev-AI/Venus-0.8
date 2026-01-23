module.exports = [
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