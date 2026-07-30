const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const {
  configureMonorepo,
  configureZustandWebResolver,
} = require('./apps/mobile/metro.helpers');

const workspaceRoot = __dirname;
const projectRoot = path.join(workspaceRoot, 'apps/mobile');

let config = getDefaultConfig(projectRoot);
config = configureMonorepo(config, projectRoot, workspaceRoot);
config = configureZustandWebResolver(config, projectRoot, workspaceRoot);

module.exports = config;
