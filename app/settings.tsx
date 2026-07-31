import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import {
  Appbar,
  Button,
  List,
  SegmentedButtons,
  Switch,
  Text,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import { SessionCard } from "../src/components/SessionCard";
import { useAppStore } from "../src/store/appStore";
import type { OrientationLock, ThemeMode } from "../src/lib/types";

/** 设置页：会话管理（多会话切换/删除） + 外观（主题/横竖屏/全屏）。 */
export default function SettingsScreen() {
  const theme = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const setActive = useAppStore((s) => s.setActive);
  const removeSession = useAppStore((s) => s.removeSession);
  const appearance = useAppStore((s) => s.appearance);
  const setAppearance = useAppStore((s) => s.setAppearance);

  const onDelete = (id: string, name: string) => {
    Alert.alert("删除会话", `确定删除「${name}」吗？`, [
      { text: "取消", style: "cancel" },
      { text: "删除", style: "destructive", onPress: () => removeSession(id) },
    ]);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
        <Appbar.Content title="设置" />
      </Appbar.Header>

      <ScrollView contentContainerStyle={styles.body}>
        {/* 会话管理 */}
        <List.Section>
          <List.Subheader>会话</List.Subheader>
          {sessions.length === 0 ? (
            <Text variant="bodyMedium" style={[styles.empty, { color: theme.colors.onSurfaceVariant }]}>
              还没有绑定任何 ZCode 设备
            </Text>
          ) : (
            sessions.map((s) => (
              <SessionCard
                key={s.id}
                session={s}
                active={s.id === activeSessionId}
                onPress={() => {
                  setActive(s.id);
                  router.replace("/");
                }}
                onActivate={() => setActive(s.id)}
                onDelete={() => onDelete(s.id, s.name)}
              />
            ))
          )}
          <Button
            mode="contained-tonal"
            icon="qrcode-scan"
            onPress={() => router.push("/scan")}
            style={styles.addBtn}
          >
            添加新设备
          </Button>
        </List.Section>

        {/* 外观：主题 */}
        <List.Section>
          <List.Subheader>外观</List.Subheader>
          <View style={styles.control}>
            <Text variant="bodyMedium" style={styles.controlLabel}>
              主题
            </Text>
            <SegmentedButtons
              value={appearance.theme}
              onValueChange={(v) => setAppearance({ theme: v as ThemeMode })}
              buttons={[
                { value: "system", label: "跟随系统" },
                { value: "light", label: "浅色" },
                { value: "dark", label: "深色" },
              ]}
            />
          </View>

          <View style={styles.control}>
            <Text variant="bodyMedium" style={styles.controlLabel}>
              屏幕方向
            </Text>
            <SegmentedButtons
              value={appearance.orientation}
              onValueChange={(v) => setAppearance({ orientation: v as OrientationLock })}
              buttons={[
                { value: "default", label: "自动" },
                { value: "portrait", label: "竖屏" },
                { value: "landscape", label: "横屏" },
              ]}
            />
          </View>

          <List.Item
            title="全屏（沉浸式）"
            description="隐藏状态栏，让 ZCode 占满整屏"
            right={(props) => (
              <Switch
                {...props}
                value={appearance.fullscreen}
                onValueChange={(v) => setAppearance({ fullscreen: v })}
              />
            )}
          />
        </List.Section>

        <Text variant="labelSmall" style={[styles.footer, { color: theme.colors.onSurfaceVariant }]}>
          ZCode Mobile · 仅作远程 Web 壳，所有任务数据仍由桌面端处理
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { paddingVertical: 8 },
  empty: { paddingHorizontal: 16, paddingVertical: 8 },
  addBtn: { marginHorizontal: 16, marginVertical: 8 },
  control: { paddingHorizontal: 16, paddingVertical: 8, gap: 8 },
  controlLabel: { marginBottom: 4 },
  footer: { textAlign: "center", paddingVertical: 24 },
});
