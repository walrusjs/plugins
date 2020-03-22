<h1 align="center">
  @walrus/plugin-commitlint
</h1>

> [commitlint](https://github.com/conventional-changelog/commitlint) 封装

## 🏗 安装

```
// npm
npm install --save --dev @walrus/cli @walrus/plugin-commitlint

// yarn
yarn add --dev @walrus/cli @walrus/plugin-commitlint
```

建议直接安装 [@walrus/preset-lint](https://github.com/walrusjs/plugins/tree/master/packages/preset-lint)

## 🛡命令

```
# 检查commit message
walrus commitlint
```

## 🌟 commitlint 配置

内置配置请查看 [commitlint.config.js](https://github.com/walrusjs/plugins/blob/master/packages/plugin-commitlint/src/commitlint.config.js)

## 📝 配置

**注意：** 优先级 Flags >> config commitlint >> config lint

可在 `.walrusrc.ts`、`walrus.config.ts`添加如下配置

```
import { Config } from '@walrus/types';

const config: Config = {
  // ...
  commitlint: {
    edit: string;
    from: string;
    to: string;
    env: string;
    verbose: boolean;
    config?: string;
  }
};

export default config;
```

## ⚡ Flags

### --edit
