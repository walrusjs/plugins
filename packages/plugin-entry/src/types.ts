export interface PluginEntryConfig {
  /**
   * 需要忽略的文件
   */
  ignore?: string[];
  /**
   * 需要扫描的目录
   */
  sacnParh?: string;
  /**
   * 输出的路径
   */
  writePath?: string;
  /**
   * 输出的模式
   * original: 和目录保持一致，不做处理
   * littleCamelCase: 小驼峰;
   * bigCamelCase: 大驼峰
   */
  format?: ((name: string) => string) | 'original' | 'littleCamelCase' | 'bigCamelCase';
}
