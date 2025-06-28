const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add resolver configuration to handle potential module resolution issues
config.resolver.platforms = ['native', 'web', 'ios', 'android'];

// Increase timeout for Metro bundler
config.server = {
  ...config.server,
  enhanceMiddleware: (middleware) => {
    return (req, res, next) => {
      // Increase timeout to prevent freezing
      res.setTimeout(300000); // 5 minutes
      return middleware(req, res, next);
    };
  },
};

// Configure transformer to handle large bundles
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    // Reduce memory usage during minification
    keep_fnames: true,
    mangle: {
      keep_fnames: true,
    },
  },
};

module.exports = config;