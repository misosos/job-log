// job-log/app/metro.config.js
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
// job-log (모노레포 루트)
const workspaceRoot = path.resolve(projectRoot, "..");

const config = getDefaultConfig(projectRoot);

// 🔥 shared, web 등 루트 기준 폴더도 감시하게끔
config.watchFolders = [
    workspaceRoot,
];

// node_modules도 루트/앱 둘 다 보게
config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, "node_modules"),
    path.resolve(workspaceRoot, "node_modules"),
];

// Expo 50 이후 권장
config.resolver.disableHierarchicalLookup = true;

module.exports = config;