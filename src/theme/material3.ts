import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

/**
 * Material You（Material 3）配色。
 *
 * 以 ZCode 品牌的青蓝为主色调，配以中性深色背景；同时提供深浅两套，
 * 交给 react-native-paper 的 Provider 切换。
 */

const brand = {
  // 主色：ZCode 标志性的青蓝
  primary: "#1FB6A6",
  primaryDark: "#0E9E8F",
  onPrimary: "#003831",
  // 强调 / 次要
  secondary: "#5AC8B8",
  tertiary: "#7FD1C4",
  // 背景层级
  surface: "#FFFFFF",
  surfaceDark: "#0B0F14",
  surfaceVariant: "#F1F5F9",
  // 文字
  onSurface: "#0B0F14",
  onSurfaceDark: "#E6EDF3",
  // 错误
  error: "#EF4444",
};

export const lightTheme: MD3Theme = {
  ...MD3LightTheme,
  dark: false,
  colors: {
    ...MD3LightTheme.colors,
    primary: brand.primary,
    primaryContainer: brand.tertiary,
    onPrimary: brand.onPrimary,
    onPrimaryContainer: brand.onPrimary,
    secondary: brand.secondary,
    secondaryContainer: brand.tertiary,
    background: brand.surface,
    surface: brand.surface,
    surfaceVariant: brand.surfaceVariant,
    onSurface: brand.onSurface,
    onSurfaceVariant: "#475569",
    outline: "#CBD5E1",
    error: brand.error,
  },
};

export const darkTheme: MD3Theme = {
  ...MD3DarkTheme,
  dark: true,
  colors: {
    ...MD3DarkTheme.colors,
    primary: brand.secondary,
    primaryContainer: brand.primaryDark,
    onPrimary: "#021F1B",
    onPrimaryContainer: "#B6F1E8",
    secondary: brand.tertiary,
    secondaryContainer: brand.primaryDark,
    background: brand.surfaceDark,
    surface: brand.surfaceDark,
    surfaceVariant: "#141B22",
    onSurface: brand.onSurfaceDark,
    onSurfaceVariant: "#9FB3C0",
    outline: "#2A3440",
    error: "#FCA5A5",
  },
};

export { brand };
