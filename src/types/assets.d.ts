/**
 * 资源模块的类型声明。
 *
 * expo-font 的 useFonts 接受 require() 或 import 进来的静态资源
 * （字体 .ttf 等），TypeScript 默认不识别这些非代码模块，需在此声明。
 */
declare module "*.ttf" {
  const value: number;
  export default value;
}

declare module "*.otf" {
  const value: number;
  export default value;
}
