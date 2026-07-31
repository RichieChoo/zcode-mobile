import React from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Text, TouchableRipple, useTheme } from "react-native-paper";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import type { Session } from "../lib/types";

interface Props {
  session: Session;
  active: boolean;
  onPress: () => void;
  onActivate?: () => void;
  onDelete?: () => void;
}

/** 会话列表卡片：展示设备名 / 绑定时间，支持设为默认与删除。 */
export function SessionCard({ session, active, onPress, onActivate, onDelete }: Props) {
  const theme = useTheme();
  return (
    <TouchableRipple
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.colors.surfaceVariant }]}
    >
      <View style={styles.row}>
        <View style={styles.main}>
          <View style={styles.titleRow}>
            <Text variant="titleMedium" numberOfLines={1} style={styles.name}>
              {session.name}
            </Text>
            {active ? (
              <View style={[styles.tag, { backgroundColor: theme.colors.primary }]}>
                <Text variant="labelSmall" style={{ color: theme.colors.onPrimary }}>
                  当前
                </Text>
              </View>
            ) : null}
          </View>
          <Text variant="bodySmall" numberOfLines={1} style={{ color: theme.colors.onSurfaceVariant }}>
            绑定于 {new Date(session.boundAt).toLocaleString()}
          </Text>
        </View>
        {!active && onActivate ? (
          <IconButton
            icon="check-circle-outline"
            onPress={onActivate}
            accessibilityLabel="设为当前会话"
          />
        ) : null}
        {onDelete ? (
          <IconButton
            icon="trash-can-outline"
            iconColor={theme.colors.error}
            onPress={onDelete}
            accessibilityLabel="删除会话"
          />
        ) : null}
      </View>
    </TouchableRipple>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, marginHorizontal: 16, marginVertical: 6, overflow: "hidden" },
  row: { flexDirection: "row", alignItems: "center", paddingRight: 4 },
  main: { flex: 1, paddingVertical: 14, paddingLeft: 16 },
  titleRow: { flexDirection: "row", alignItems: "center", marginBottom: 2 },
  name: { fontWeight: "600", flexShrink: 1 },
  tag: { marginLeft: 8, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999 },
});
