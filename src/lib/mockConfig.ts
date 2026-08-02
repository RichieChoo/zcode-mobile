import { parseRemoteUrl } from "./parseRemoteUrl";
import type { ParsedRemoteUrl } from "./types";

/**
 * 本地 Mock 开发模式。
 *
 * 在项目根目录的 `.env`（或 `.env.development`）里配置：
 *   EXPO_PUBLIC_MOCK_URL=https://zcode.z.ai/remote/v4?sid=...
 *
 * 配置后，空状态首页会显示「Mock 链接」按钮，一键用该链接创建会话进入 WebView，
 * 便于在本地开发/调试系统功能（工具栏、刷新、外观等），无需每次扫码。
 *
 * 注意：
 * - `EXPO_PUBLIC_` 前缀的变量会内联进 JS bundle（Expo 原生支持 .env 文件）。
 * - 生产构建（release / EAS build）时若不提供该变量，mock 入口自动隐藏，
 *   完全不影响正常的扫码绑定流程。
 * - `.env` 已被 .gitignore 忽略，请勿提交真实会话链接。
 */

function readMockUrl(): string {
  // expo 会把 .env 里的 EXPO_PUBLIC_* 注入 process.env。
  const raw = (process.env.EXPO_PUBLIC_MOCK_URL ?? "").trim();
  return raw;
}

/** 解析后的 mock 链接（无效则为 null）。 */
export const mockRemote: ParsedRemoteUrl | null = (() => {
  const raw = readMockUrl();
  if (!raw) return null;
  const parsed = parseRemoteUrl(raw);
  return parsed.valid ? parsed : null;
})();

/** 是否启用 mock 开发模式。 */
export const isMockEnabled = mockRemote !== null;
