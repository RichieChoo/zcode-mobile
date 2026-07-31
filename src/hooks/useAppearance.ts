import { useEffect, useMemo } from "react";
import { Platform, useColorScheme } from "react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import * as SystemUI from "expo-system-ui";

import { useAppStore } from "../store/appStore";
import { darkTheme, lightTheme } from "../theme/material3";
import type { OrientationLock, ThemeMode } from "../lib/types";

/** 把 store 里的外观配置映射成实际的系统行为（横竖屏、状态栏）并返回当前主题。 */
export function useAppearance() {
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);
  const systemScheme = useColorScheme();

  // 解析最终主题（system 跟随系统）
  const isDark = useMemo(() => {
    const mode: ThemeMode = appearance.theme;
    if (mode === "system") return systemScheme === "dark";
    return mode === "dark";
  }, [appearance.theme, systemScheme]);

  const theme = isDark ? darkTheme : lightTheme;

  // 屏幕方向锁定。iOS 与 Android 的锁策略枚举语义有差异：
  //  - Android「不锁」用 DEFAULT；iOS「不锁」用 ALL。
  //  - PORTRAIT_UP / LANDSCAPE 两端通用（iOS LANDSCAPE 锁为左/右横屏均可）。
  useEffect(() => {
    const lockFor = (lock: OrientationLock): ScreenOrientation.OrientationLock => {
      if (lock === "default") {
        // iOS 没有 DEFAULT，用 ALL 表示不锁。
        return Platform.OS === "ios"
          ? ScreenOrientation.OrientationLock.ALL
          : ScreenOrientation.OrientationLock.DEFAULT;
      }
      if (lock === "portrait") return ScreenOrientation.OrientationLock.PORTRAIT_UP;
      return ScreenOrientation.OrientationLock.LANDSCAPE;
    };
    ScreenOrientation.lockAsync(lockFor(appearance.orientation)).catch(() => {});
  }, [appearance.orientation]);

  // 全屏（沉浸式）：把系统底层背景设为主题背景；状态栏的隐藏/样式交给
  // 根布局里的 <StatusBar /> 组件根据 appearance 状态统一渲染。
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(theme.colors.background).catch(() => {});
  }, [theme.colors.background]);

  return { appearance, setAppearance, theme, isDark };
}
