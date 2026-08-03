import React, { useEffect } from "react";
import { ActivityIndicator, MD3DarkTheme, MD3LightTheme, PaperProvider } from "react-native-paper";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";

import { useAppearance } from "../src/hooks/useAppearance";
import { useAppStore } from "../src/store/appStore";

/**
 * App 根布局：水合持久化数据、注入主题与 Paper Provider、声明路由栈。
 * 主题 / 横竖屏 / 全屏（状态栏隐藏）由 useAppearance 统一驱动。
 *
 * 图标字体（@expo/vector-icons 的 MaterialCommunityIcons）由该库在组件挂载时
 * 自行通过 expo-font 加载，无需在此预加载；前提是项目根目录存在 metro.config.js
 * （已配置 expo 的默认资产解析）。
 */
export default function RootLayout() {
  const hydrated = useAppStore((s) => s.hydrated);
  const hydrate = useAppStore((s) => s.hydrate);
  const { theme, isDark, appearance } = useAppearance();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // 合并 paper 内置 MD3 主题与我们的配色（保留字体等默认项）。
  const paperTheme = isDark
    ? { ...MD3DarkTheme, ...theme, colors: { ...MD3DarkTheme.colors, ...theme.colors }, dark: true }
    : { ...MD3LightTheme, ...theme, colors: { ...MD3LightTheme.colors, ...theme.colors }, dark: false };

  if (!hydrated) {
    return (
      <PaperProvider theme={paperTheme}>
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <ActivityIndicator
            size="large"
            color={theme.colors.primary}
            style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
          />
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={paperTheme}>
      <StatusBar
        style={isDark ? "light" : "dark"}
        hidden={appearance.fullscreen}
        backgroundColor={theme.colors.background}
      />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
          animation: "fade",
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="scan" />
        <Stack.Screen name="remote" />
      </Stack>
    </PaperProvider>
  );
}
