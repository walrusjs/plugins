<h1 align="center">
  @walrus/preset-lint
</h1>

lint 插件集，包含以下插件

* [@walrus/plugin-commitlint](https://github.com/walrusjs/plugins/tree/master/packages/plugin-commitlint)
* [@walrus/plugin-eslint](https://github.com/walrusjs/plugins/tree/master/packages/plugin-eslint)
* [@walrus/plugin-prettier](https://github.com/walrusjs/plugins/tree/master/packages/plugin-prettier)
* [@walrus/plugin-stylelint](https://github.com/walrusjs/plugins/tree/master/packages/plugin-stylelint)

## 🏗 安装

```
// npm
npm install --save --dev @walrus/cli @walrus/preset-lint

// yarn
yarn add --dev @walrus/cli @walrus/preset-lint
```

## 🛡提供命令

```
# 检查commit message
walrus commitlint

# 检查 javascript/typesxcript 文件
walrus eslint

# 美化代码
walrus prettier

# 检查样式文件(css、less、scss、...)
walrus stylelint
```

## 📝 配置

可在 `.walrusrc.ts`、`walrus.config.ts`添加如下配置

```
import { Config } from '@walrus/types';

const config: Config = {
  // ...
  lint: {
    // 暂存模式，只处理暂存的文件，处理完毕后将重新暂存
    staged: boolean;
    // 设置为false，处理完文件，不重新暂存
    restage: boolean;
  }
};

export default config;
```
