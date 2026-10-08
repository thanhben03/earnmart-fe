// Metro configuration for Expo in Monorepo
// Ensures watchFolders only targets existing directories, preventing Windows ENOENT watcher crashes
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Confine watchFolders to the mobile project root and node_modules
config.watchFolders = [projectRoot, workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(workspaceRoot, 'node_modules'),
];

module.exports = withNativeWind(config, {
  input: './global.css',
  inlineRem: 16,
});
