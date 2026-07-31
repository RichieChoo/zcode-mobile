/** 生成一个足够稳定的随机 id（无需引入额外 uuid 依赖）。 */
export function makeId(): string {
  // 优先用平台 crypto.randomUUID；否则用 Math.random 兜底。
  try {
    const g = globalThis as unknown as { crypto?: { randomUUID?: () => string } };
    if (g.crypto?.randomUUID) return g.crypto.randomUUID();
  } catch {
    /* ignore */
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
