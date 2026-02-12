const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Find the project and workspace directories
const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '..');

const config = getDefaultConfig(projectRoot);

// 1. Watch all files within the monorepo
config.watchFolders = [workspaceRoot];

// 2. Let Metro look for modules within the workspace's node_modules, then root's node_modules
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
];

// 3. Force Metro to resolve (sub)dependencies only from the `nodeModulesPaths`
// This prevents it from wandering into the root and getting confused about assets
config.resolver.disableHierarchicalLookup = true;

// 4. When running with EXPO_GO=1, mock native modules that crash in Expo Go
//    Usage: EXPO_GO=1 npx expo start
if (process.env.EXPO_GO === '1') {
    const skiaMockPath = path.resolve(projectRoot, 'src/mocks/skia-mock.js');

    const originalResolveRequest = config.resolver.resolveRequest;

    config.resolver.resolveRequest = (context, moduleName, platform) => {
        if (moduleName === '@shopify/react-native-skia') {
            return { filePath: skiaMockPath, type: 'sourceFile' };
        }

        if (originalResolveRequest) {
            return originalResolveRequest(context, moduleName, platform);
        }
        return context.resolveRequest(context, moduleName, platform);
    };
}

module.exports = config;
