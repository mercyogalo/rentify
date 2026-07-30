const fs = require('fs');
const path = require('path');

function configureMonorepo(config, projectRoot, workspaceRoot) {
  config.watchFolders = [workspaceRoot];
  config.resolver.disableHierarchicalLookup = true;
  config.resolver.nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ];
  return config;
}

/**
 * Zustand's .mjs builds use import.meta.env, which breaks Expo web (classic script bundle).
 * Force the CJS .js entry points on web.
 */
function configureZustandWebResolver(config, projectRoot, workspaceRoot) {
  const nodeModulesPaths = [
    path.resolve(projectRoot, 'node_modules'),
    path.resolve(workspaceRoot, 'node_modules'),
  ];

  const defaultResolveRequest = config.resolver.resolveRequest;

  config.resolver.resolveRequest = (context, moduleName, platform) => {
    if (
      platform === 'web' &&
      (moduleName === 'zustand' || moduleName.startsWith('zustand/'))
    ) {
      const subpath = moduleName === 'zustand' ? 'index' : moduleName.slice('zustand/'.length);

      for (const nodeModulesPath of nodeModulesPaths) {
        try {
          const pkgRoot = path.dirname(
            require.resolve('zustand/package.json', { paths: [nodeModulesPath] })
          );
          const filePath = path.join(pkgRoot, `${subpath}.js`);
          if (fs.existsSync(filePath)) {
            return { type: 'sourceFile', filePath };
          }
        } catch {
          // try next node_modules path
        }
      }
    }

    if (defaultResolveRequest) {
      return defaultResolveRequest(context, moduleName, platform);
    }

    return context.resolveRequest(context, moduleName, platform);
  };

  return config;
}

module.exports = { configureMonorepo, configureZustandWebResolver };
