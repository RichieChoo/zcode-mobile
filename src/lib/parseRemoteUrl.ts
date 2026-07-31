import type { ParsedRemoteUrl } from "./types";

/**
 * 解析扫码或手动输入得到的内容，判断是否为 ZCode remote 链接并提取展示字段。
 *
 * 兼容三种输入：
 *  1. 直接是一条 https://zcode.z.ai/remote/... URL（最常见，桌面端二维码即此格式）；
 *  2. 整个内容是 JSON 且含 url 字段（个别客户端会把链接包成 JSON）；
 *  3. 带有 zcode scheme / 其他 host 但路径是 /remote 的链接。
 */
export function parseRemoteUrl(raw: string): ParsedRemoteUrl {
  const text = (raw ?? "").trim();
  const fallback: ParsedRemoteUrl = { valid: false, url: text };

  if (!text) return fallback;

  // 情况 2：JSON 包裹
  if (text.startsWith("{")) {
    try {
      const obj = JSON.parse(text) as Record<string, unknown>;
      const inner = typeof obj.url === "string" ? obj.url : "";
      if (inner) return parseRemoteUrl(inner);
    } catch {
      /* fall through */
    }
  }

  let u: URL;
  try {
    u = new URL(text);
  } catch {
    return fallback;
  }

  // 接受 zcode.z.ai 下的 /remote 路径；放宽 host 以兼容私有部署。
  const isRemotePath = u.pathname.startsWith("/remote");
  if (!isRemotePath) return fallback;

  return {
    valid: true,
    url: u.toString(),
    name: u.searchParams.get("name") ?? undefined,
    appVersion: u.searchParams.get("app_version") ?? undefined,
    mid: u.searchParams.get("mid") ?? undefined,
  };
}
