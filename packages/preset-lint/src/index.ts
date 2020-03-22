export default () => {
  return {
    plugins: [
      require.resolve('./plugins/lint'),

      require.resolve('@walrus/plugin-commitlint'),
      require.resolve('@walrus/plugin-eslint'),
      require.resolve('@walrus/plugin-prettier'),
      require.resolve('@walrus/plugin-stylelint')
    ]
  };
};
