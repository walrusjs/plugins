<h1 align="center">
  @walrus/plugin-prettier
</h1>

> 封装 [prettier](https://github.com/prettier/prettier)

## 🏗 安装

```
// npm
npm install --save --dev @walrus/cli @walrus/plugin-prettier

// yarn
yarn add --dev @walrus/cli @walrus/plugin-prettier
```

建议直接安装 [@walrus/preset-lint](https://github.com/walrusjs/plugins/tree/master/packages/preset-lint)

## 🛡命令

```
# 美化代码
walrus prettier
```

## 🌟 Prettier 配置

内置配置请查看 [prettier.config.js](https://github.com/walrusjs/plugins/blob/master/packages/plugin-prettier/src/prettier.config.js)

## 📝 配置

**注意：** 优先级 Flags >> config prettier >> config lint

可在 `.walrusrc.ts`、`walrus.config.ts`添加如下配置

```
import { Config } from '@walrus/types';

const config: Config = {
  // ...
  prettier: {
    staged: boolean;
    restage: boolean;
    pattern: string;
    verbose: boolean;
    bail: boolean;
    check: boolean;
  }
};

export default config;
```

## ⚡ Flags

### --staged

预提交模式，开启的情况下，已暂存的文件将被格式化，且格式化完成后将被重新暂存；

### --no-restage

与 `--staged` 一起使用可在格式化后跳过重新暂存文件

### --pattern

过滤给定的 [minimatch](https://github.com/isaacs/minimatch) 模式的文件。

举例：

```
walrus prettier --pattern "**/*.*(js|jsx)"
```

### --verbose

在处理每个文件之前输出文件的名称。 如果发生错误并且无法确定是哪个文件引起了问题，这将很有用。

### --bail

如果有固定文件，防止 git commit。

### --check

检查文件格式是否正确，但不要格式化。
