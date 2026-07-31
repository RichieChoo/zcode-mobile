/**
 * 一条已绑定的 ZCode 远程会话。
 *
 * 桌面端 ZCode 会生成一个二维码，二维码内容即一条 remote URL，例如：
 *   https://zcode.z.ai/remote/v4?sid=...&hash=...&t=...&mid=...&name=...&app_version=...
 * 扫码后我们把整条 URL 存下来作为 WebView 的入口地址，同时解析出几个展示字段。
 */
export interface Session {
  /** 稳定唯一 id（uuid）。 */
  id: string;
  /** 用户可编辑的显示名，默认取二维码里的 name 字段（设备名）。 */
  name: string;
  /** 完整的 remote URL，WebView 直接加载它建立连接。 */
  url: string;
  /** 绑定时间（毫秒时间戳）。 */
  boundAt: number;
}

/** 从 remote URL 解析出的可读字段。 */
export interface ParsedRemoteUrl {
  /** 是否为有效的 zcode remote 链接。 */
  valid: boolean;
  /** 原始 URL（已 trim）。 */
  url: string;
  /** 设备名（name 参数）。 */
  name?: string;
  /** 桌面端 app 版本（app_version 参数）。 */
  appVersion?: string;
  /** 会话 id（mid 参数）。 */
  mid?: string;
}

/** 主题模式。 */
export type ThemeMode = "system" | "light" | "dark";

/** 屏幕方向锁定。 */
export type OrientationLock = "default" | "portrait" | "landscape";

/** 全部持久化的外观配置。 */
export interface Appearance {
  theme: ThemeMode;
  orientation: OrientationLock;
  fullscreen: boolean;
}
