module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript'],
  rules: {
    // ts 中用 a?.b?.method()提示no-unused-expressions错误
    'no-unused-expressions': 'off'
  }
};
