const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');
const { configureMonorepo, configureZustandWebResolver } = require('./metro.helpers');

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, '../..');

let config = getDefaultConfig(projectRoot);
config = configureMonorepo(config, projectRoot, workspaceRoot);
config = configureZustandWebResolver(config, projectRoot, workspaceRoot);

module.exports = config;
