<h1 align="center">
  @walrus/plugin-release
</h1>

本插件支持三种发布形式

- 单包项目 **默认**
- 多包项目(Lerna) 统一版本
- 多包项目(Lerna) 单个版本

## 发布步骤

- 确定发布模式，根据项目根目录是否存在`lerna.json`来区分是否是多包
- 检查 Git 状态，是否存在未提交的文件 **可跳过**
- 检查 npm registry **可跳过**
- 编译项目，执行 `npm run build` **可跳过**

**以下为单包项目独有的发布步骤**

- 获取需要发布的版本
- 修改 `package.json` 中的版本
- git commit
- git tag
- git push
- 发布项目 **可跳过**

**以下为多包独立版本独有的发布步骤**

- 修改版本
- git commit
- git tag
- git push
- publish **可跳过**

**以下为多包统一版本独有的发布步骤**

- 修改版本
- git commit
- git tag
- git push
- publish **可跳过**

## 🏗 安装

```
// npm
npm install --save --dev @walrus/cli @walrus/plugin-release

// yarn
yarn add --dev @walrus/cli @walrus/plugin-release
```

## 🛡 命令

```
# 发布项目
walrus release
```

## ⚡ Flags

### --skip-build

跳过编译，发布过程会默认执行 `npm run build`，设置此项可跳过；

### --skip-publish

跳过发布，如果项目不需要发布到 npm ，请设置此项跳过

### --repo-url

仓库地址，无需设置 `https://github.com/`

### --repo-url-prefix

仓库地址前缀，默认 `https://github.com/`

### --skip-git-status-check

跳过 Git 状态检查，检查发布前是否有未提交的文件

### --skip-changelog

跳过生成 changelog
