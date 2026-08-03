import React from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Appbar, Divider, SegmentedButtons, Switch, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { useAppStore } from "../src/store/appStore";
import type { OrientationLock, ThemeMode } from "../src/lib/types";

/** 系统显示偏好；链接本身统一在首页管理。 */
export default function SettingsScreen() {
  const theme = useTheme();
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
        <Appbar.Content title="系统设置" titleStyle={styles.appbarTitle} />
      </Appbar.Header>
      <ScrollView contentContainerStyle={styles.body}>
        <Text variant="headlineSmall" style={styles.heading}>外观与系统</Text>
        <Text variant="bodyMedium" style={[styles.intro, { color: theme.colors.onSurfaceVariant }]}>这些偏好只影响 ZCode-Moblie 在本机上的显示方式。</Text>

        <View style={[styles.panel, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}>
          <Text variant="titleSmall" style={styles.panelTitle}>显示偏好</Text>
          <View style={styles.control}>
            <Text variant="bodyMedium" style={styles.controlLabel}>主题</Text>
            <SegmentedButtons
              value={appearance.theme}
              onValueChange={(value) => void setAppearance({ theme: value as ThemeMode })}
              buttons={[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
              ]}
            />
          </View>
          <Divider />
          <View style={styles.control}>
            <Text variant="bodyMedium" style={styles.controlLabel}>屏幕方向</Text>
            <SegmentedButtons
              value={appearance.orientation}
              onValueChange={(value) => void setAppearance({ orientation: value as OrientationLock })}
              buttons={[
                { value: "default", label: "自动" },
                { value: "portrait", label: "竖屏" },
                { value: "landscape", label: "横屏" },
              ]}
            />
          </View>
          <Divider />
          <View style={styles.toggleRow}>
            <View style={styles.toggleCopy}>
              <Text variant="titleSmall" style={styles.listTitle}>沉浸式工作台</Text>
              <Text variant="bodySmall" style={{ color: theme.colors.onSurfaceVariant }}>在远端工作台中隐藏系统状态栏</Text>
            </View>
            <Switch value={appearance.fullscreen} onValueChange={(value) => void setAppearance({ fullscreen: value })} />
          </View>
        </View>
        <Text variant="labelSmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>ZCode-Moblie · 链接与显示偏好仅保存在本机</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  appbar: { backgroundColor: "transparent" },
  appbarTitle: { fontWeight: "700" },
  body: { padding: 20, paddingBottom: 40 },
  heading: { fontWeight: "800", marginTop: 8 },
  intro: { marginTop: 6, lineHeight: 20 },
  panel: { borderWidth: 1, borderRadius: 8, marginTop: 24, overflow: "hidden" },
  panelTitle: { fontWeight: "700", paddingHorizontal: 16, paddingTop: 18 },
  control: { paddingHorizontal: 16, paddingVertical: 16, gap: 10 },
  controlLabel: { fontWeight: "600" },
  listTitle: { fontWeight: "600" },
  toggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, padding: 16 },
  toggleCopy: { flex: 1, gap: 3 },
  footer: { textAlign: "center", paddingTop: 28, lineHeight: 18 },
});
