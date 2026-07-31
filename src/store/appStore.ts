import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Appearance, Session } from "../lib/types";

const SESSIONS_KEY = "zcode.sessions.v1";
const ACTIVE_KEY = "zcode.activeSessionId.v1";
const APPEARANCE_KEY = "zcode.appearance.v1";

const DEFAULT_APPEARANCE: Appearance = {
  theme: "system",
  orientation: "default",
  fullscreen: false,
};

interface AppState {
  /** 全部已绑定的会话。 */
  sessions: Session[];
  /** 当前激活的会话 id（用于 WebView 承载页）。 */
  activeSessionId: string | null;
  /** 外观配置。 */
  appearance: Appearance;
  /** store 是否已完成从 AsyncStorage 的水合（hydration）。 */
  hydrated: boolean;

  /** 从 AsyncStorage 读取持久化数据，App 启动时调用一次。 */
  hydrate: () => Promise<void>;
  /** 新增一条会话，并设为当前激活。 */
  addSession: (session: Session) => Promise<void>;
  /** 更新某条会话（改名 / 改 URL）。 */
  updateSession: (id: string, patch: Partial<Omit<Session, "id">>) => Promise<void>;
  /** 删除某条会话；若删的是当前激活会话，自动切到剩余的第一条。 */
  removeSession: (id: string) => Promise<void>;
  /** 切换当前激活会话。 */
  setActive: (id: string | null) => Promise<void>;
  /** 更新外观配置（合并写）。 */
  setAppearance: (patch: Partial<Appearance>) => Promise<void>;
}

async function readSessions(): Promise<Session[]> {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    return raw ? (JSON.parse(raw) as Session[]) : [];
  } catch {
    return [];
  }
}

async function writeSessions(list: Session[]) {
  await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
}

export const useAppStore = create<AppState>((set, get) => ({
  sessions: [],
  activeSessionId: null,
  appearance: DEFAULT_APPEARANCE,
  hydrated: false,

  async hydrate() {
    const [sessions, activeId, appearanceRaw] = await Promise.all([
      readSessions(),
      AsyncStorage.getItem(ACTIVE_KEY),
      AsyncStorage.getItem(APPEARANCE_KEY),
    ]);
    let appearance = DEFAULT_APPEARANCE;
    if (appearanceRaw) {
      try {
        appearance = { ...DEFAULT_APPEARANCE, ...(JSON.parse(appearanceRaw) as Partial<Appearance>) };
      } catch {
        /* keep default */
      }
    }
    set({
      sessions,
      activeSessionId: activeId && sessions.some((s) => s.id === activeId) ? activeId : sessions[0]?.id ?? null,
      appearance,
      hydrated: true,
    });
  },

  async addSession(session) {
    const list = [...get().sessions.filter((s) => s.id !== session.id), session];
    await writeSessions(list);
    await AsyncStorage.setItem(ACTIVE_KEY, session.id);
    set({ sessions: list, activeSessionId: session.id });
  },

  async updateSession(id, patch) {
    const list = get().sessions.map((s) => (s.id === id ? { ...s, ...patch } : s));
    await writeSessions(list);
    set({ sessions: list });
  },

  async removeSession(id) {
    const list = get().sessions.filter((s) => s.id !== id);
    await writeSessions(list);
    const nextActive =
      get().activeSessionId === id ? (list[0]?.id ?? null) : get().activeSessionId;
    if (nextActive) await AsyncStorage.setItem(ACTIVE_KEY, nextActive);
    else await AsyncStorage.removeItem(ACTIVE_KEY);
    set({ sessions: list, activeSessionId: nextActive });
  },

  async setActive(id) {
    if (id) await AsyncStorage.setItem(ACTIVE_KEY, id);
    else await AsyncStorage.removeItem(ACTIVE_KEY);
    set({ activeSessionId: id });
  },

  async setAppearance(patch) {
    const next = { ...get().appearance, ...patch };
    await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(next));
    set({ appearance: next });
  },
}));

/** 取当前激活的会话对象（便于组件直接消费）。 */
export function selectActiveSession(s: AppState): Session | undefined {
  return s.sessions.find((x) => x.id === s.activeSessionId);
}
