module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': '.',
          },
        },
      ],
      // Ensure reanimated plugin is last
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          'react-native-reanimated/plugin',
        ],
      },
    },
  };
};