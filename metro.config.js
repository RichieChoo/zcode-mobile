// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require("expo/metro-config");

/** Expo 默认 Metro 配置（含资产解析、字体等）。bare/prebuild 模式下必须存在。 */
const config = getDefaultConfig(__dirname);

module.exports = config;
