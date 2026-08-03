import React, { useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { Button, Divider, IconButton, Text, TextInput, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";

import type { Session } from "../src/lib/types";
import { makeId } from "../src/lib/id";
import { isMockEnabled, mockRemote } from "../src/lib/mockConfig";
import { useAppStore } from "../src/store/appStore";
import { BottomNav } from "../src/components/BottomNav";

/** 链接管理首页：链接列表优先，远端工作台作为明确进入的二级页面。 */
export default function LinkManagerScreen() {
  const theme = useTheme();
  const sessions = useAppStore((s) => s.sessions);
  const activeSessionId = useAppStore((s) => s.activeSessionId);
  const setActive = useAppStore((s) => s.setActive);
  const removeSession = useAppStore((s) => s.removeSession);
  const addSession = useAppStore((s) => s.addSession);
  const [query, setQuery] = useState("");

  const orderedSessions = useMemo(
    () => [...sessions].sort((a, b) => b.boundAt - a.boundAt),
    [sessions],
  );
  const activeSession = sessions.find((session) => session.id === activeSessionId);
  const visibleSessions = orderedSessions.filter((session) => {
    const value = `${session.name} ${session.url}`.toLocaleLowerCase();
    return value.includes(query.trim().toLocaleLowerCase());
  });

  const activate = (session: Session) => {
    void setActive(session.id);
  };

  const openWorkspace = () => {
    if (activeSession) router.push("/remote");
    else router.push("/scan");
  };

  const deleteSession = (session: Session) => {
    Alert.alert("移除链接", `确定移除「${session.name}」吗？`, [
      { text: "取消", style: "cancel" },
      { text: "移除", style: "destructive", onPress: () => void removeSession(session.id) },
    ]);
  };

  const addMockSession = () => {
    if (!mockRemote) return;
    void addSession({
      id: makeId(),
      name: mockRemote.name ?? "Mock ZCode",
      url: mockRemote.url,
      boundAt: Date.now(),
    });
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={["top", "bottom"]}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.brandGroup}>
            <LogoMark />
            <View>
              <Text variant="headlineSmall" style={styles.heading}>ZCode 管理器</Text>
              <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>管理 HTTPS 链接</Text>
            </View>
          </View>
          <IconButton icon="plus" size={24} onPress={() => router.push("/scan")} accessibilityLabel="添加链接" />
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          mode="outlined"
          placeholder="搜索或粘贴 ZCode 链接"
          left={<TextInput.Icon icon="magnify" />}
          right={query ? <TextInput.Icon icon="close" onPress={() => setQuery("")} /> : undefined}
          outlineStyle={styles.searchOutline}
          style={styles.search}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          onSubmitEditing={() => router.push({ pathname: "/scan", params: { manual: "1" } })}
        />

        {activeSession ? (
          <View style={[styles.currentCard, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}>
            <Text variant="labelLarge" style={{ color: theme.colors.onSurfaceVariant }}>当前使用</Text>
            <Text variant="titleLarge" numberOfLines={1} style={styles.currentName}>{activeSession.name}</Text>
            <Text variant="bodyMedium" numberOfLines={1} style={[styles.url, { color: theme.colors.onSurfaceVariant }]}>{displayUrl(activeSession.url)}</Text>
            <View style={styles.currentActions}>
              <Button mode="contained" icon="open-in-new" contentStyle={styles.buttonContent} style={styles.flexButton} onPress={openWorkspace}>打开工作台</Button>
              <Button mode="outlined" contentStyle={styles.buttonContent} style={styles.flexButton} onPress={() => router.push("/scan")}>添加链接</Button>
            </View>
          </View>
        ) : (
          <View style={[styles.emptyCard, { backgroundColor: theme.colors.surfaceVariant }]}>
            <View style={styles.emptyInner}>
              <LogoMark compact />
              <Text variant="titleLarge" style={styles.emptyTitle}>还没有 ZCode 链接</Text>
              <Text variant="bodyMedium" style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>扫描桌面端二维码，或手动粘贴远程链接后开始管理。</Text>
              <Button mode="contained" icon="qrcode-scan" onPress={() => router.push("/scan")}>添加第一个链接</Button>
              {isMockEnabled ? <Button mode="text" icon="flask-outline" onPress={addMockSession} style={styles.mockButton}>载入开发 Mock</Button> : null}
            </View>
          </View>
        )}

        {sessions.length > 0 ? (
          <>
            <SectionTitle title="全部链接" count={visibleSessions.length} />
            <View style={[styles.list, { borderColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}>
              {visibleSessions.length ? visibleSessions.map((session, index) => (
                <React.Fragment key={session.id}>
                  {index > 0 ? <Divider /> : null}
                  <LinkRow session={session} active={session.id === activeSessionId} onActivate={() => activate(session)} onDelete={() => deleteSession(session)} />
                </React.Fragment>
              )) : <Text variant="bodyMedium" style={[styles.noResult, { color: theme.colors.onSurfaceVariant }]}>没有匹配的链接</Text>}
            </View>
          </>
        ) : null}
      </ScrollView>

      <BottomNav active="links" onOpenWorkspace={openWorkspace} />
    </SafeAreaView>
  );
}

function LogoMark({ compact = false }: { compact?: boolean }) {
  return <View style={[styles.logo, compact && styles.logoCompact]}><Text style={[styles.logoText, compact && styles.logoTextCompact]}>Z</Text></View>;
}

function SectionTitle({ title, count }: { title: string; count: number }) {
  const theme = useTheme();
  return <View style={styles.sectionTitle}><Text variant="headlineSmall" style={styles.sectionHeading}>{title}</Text><Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant }}>{count} 条</Text></View>;
}

function LinkRow({ session, active, onActivate, onDelete }: { session: Session; active: boolean; onActivate: () => void; onDelete: () => void }) {
  const theme = useTheme();
  return (
    <Pressable onPress={onActivate} style={({ pressed }) => [styles.linkRow, pressed && { backgroundColor: theme.colors.surfaceVariant }]} accessibilityRole="button" accessibilityLabel={`使用链接 ${session.name}`}>
      <LogoMark compact />
      <View style={styles.linkDetails}>
        <View style={styles.linkNameRow}>
          <Text variant="titleSmall" numberOfLines={1} style={styles.linkName}>{session.name}</Text>
          {active ? <View style={[styles.activePill, { backgroundColor: theme.colors.primaryContainer }]}><Text variant="labelSmall" style={{ color: theme.colors.onPrimaryContainer }}>当前</Text></View> : null}
        </View>
        <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>{displayUrl(session.url)}</Text>
      </View>
      <IconButton icon="trash-can-outline" size={20} iconColor={theme.colors.onSurfaceVariant} onPress={onDelete} accessibilityLabel={`移除 ${session.name}`} />
    </Pressable>
  );
}

function displayUrl(value: string) {
  try {
    const url = new URL(value);
    return `${url.host}${url.pathname === "/" ? "" : url.pathname}`;
  } catch {
    return value;
  }
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 20, paddingBottom: 24, flexGrow: 1 },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  brandGroup: { flexDirection: "row", alignItems: "center", gap: 14 },
  logo: { width: 64, height: 64, borderRadius: 18, backgroundColor: "#17181B", justifyContent: "center", alignItems: "center" },
  logoCompact: { width: 38, height: 38, borderRadius: 11 },
  logoText: { color: "#FFFFFF", fontSize: 32, fontWeight: "500", lineHeight: 38 },
  logoTextCompact: { fontSize: 19, lineHeight: 24 },
  heading: { fontWeight: "800" },
  search: { backgroundColor: "transparent", marginBottom: 16 },
  searchOutline: { borderRadius: 28 },
  currentCard: { borderWidth: 1, borderRadius: 8, padding: 20 },
  currentName: { fontWeight: "800", marginTop: 6 },
  url: { fontFamily: "monospace", marginTop: 4 },
  currentActions: { flexDirection: "row", gap: 10, marginTop: 20 },
  flexButton: { flex: 1 },
  buttonContent: { minHeight: 44 },
  emptyCard: { flex: 1, borderRadius: 8, padding: 24, justifyContent: "center" },
  emptyInner: { alignItems: "center" },
  emptyTitle: { fontWeight: "800", marginTop: 16 },
  emptyText: { textAlign: "center", lineHeight: 20, marginTop: 8, marginBottom: 20 },
  mockButton: { marginTop: 8 },
  sectionTitle: { flexDirection: "row", alignItems: "baseline", justifyContent: "space-between", marginTop: 28, marginBottom: 12, paddingHorizontal: 2 },
  sectionHeading: { fontWeight: "800" },
  list: { borderWidth: 1, borderRadius: 8, overflow: "hidden" },
  linkRow: { flexDirection: "row", alignItems: "center", paddingLeft: 14, paddingVertical: 10, paddingRight: 2 },
  linkDetails: { flex: 1, minWidth: 0, marginLeft: 12 },
  linkNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  linkName: { flexShrink: 1, fontWeight: "700" },
  activePill: { borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2 },
  noResult: { padding: 20, textAlign: "center" },
});
