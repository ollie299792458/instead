const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure CommonJS builds are favored over ESM with import.meta.env for web bundling
config.resolver.unstable_conditionNames = ['require', 'default', 'react-native'];

module.exports = config;
