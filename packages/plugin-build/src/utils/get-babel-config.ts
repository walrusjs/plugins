import { resolve } from './';

export default function (modules) {
  return {
    presets: [
      [
        resolve('@birman/babel-preset-birman/dependency'),
        {
          env: {
            useBuiltIns: 'entry',
            corejs: 3,
            modules: false,
            targets: {
              browsers: [
                'last 2 versions',
                'Firefox ESR',
                '> 1%',
                'ie >= 9',
                'iOS >= 8',
                'Android >= 4',
              ],
            }
          }
        },
      ],
    ]
  };
};
