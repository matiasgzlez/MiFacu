const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// 1. Find the project and workspace directories
const projectRoot = __dirname;

const config = getDefaultConfig(projectRoot);

// 2. Watch all files in the monorepo
config.watchFolders = [projectRoot];

// 3. Let Metro look in the root node_modules and the frontend node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(projectRoot, 'frontend/node_modules'),
];

module.exports = config;
