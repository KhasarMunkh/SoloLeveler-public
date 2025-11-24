module.exports = function(api) {
    api.cache(true);
    return {
        presets: [
            ["babel-preset-expo", { jsxImportSource: "nativewind" }],
            "nativewind/babel",
        ],
        plugins: [
            // helpful for web builds with RN Web + Reanimated 4
            "@babel/plugin-proposal-export-namespace-from",
            // Reanimated 4 plugin – keep this LAST
            "react-native-worklets/plugin",
        ],
    };
};
