import { MD3DarkTheme, MD3LightTheme } from "react-native-paper";
import type { MD3Theme } from "react-native-paper";

/**
 * Material You（Material 3）配色。
 *
 * 以明确的蓝色操作色配以黑白中性层级；同时提供深浅两套，
 * 交给 react-native-paper 的 Provider 切换。
 */

const brand = {
  primary: "#326CE5",
  primaryDark: "#2554BA",
  onPrimary: "#FFFFFF",
  // 强调 / 次要
  secondary: "#596171",
  tertiary: "#DCE7FF",
  // 背景层级
  surface: "#FFFFFF",
  surfaceDark: "#111214",
  surfaceVariant: "#F4F4F6",
  // 文字
  onSurface: "#1C1C20",
  onSurfaceDark: "#F2F2F5",
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
    onSurfaceVariant: "#6B6C75",
    outline: "#D1D2D8",
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
    onPrimary: "#FFFFFF",
    onPrimaryContainer: "#DCE7FF",
    secondary: brand.tertiary,
    secondaryContainer: brand.primaryDark,
    background: brand.surfaceDark,
    surface: brand.surfaceDark,
    surfaceVariant: "#141B22",
    onSurface: brand.onSurfaceDark,
    onSurfaceVariant: "#B4B5BC",
    outline: "#3C3D44",
    error: "#FCA5A5",
  },
};

export { brand };
