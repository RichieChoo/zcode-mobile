import React from "react";
import { StyleSheet, View } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

interface Props {
  /** 点击「扫码绑定」主按钮。 */
  onScan: () => void;
  /** 点击「手动输入 URL」次按钮（可选）。 */
  onManual?: () => void;
}

/** 首启动空状态：引导用户扫码绑定桌面端 ZCode。 */
export function EmptyState({ onScan, onManual }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]}>
      <View style={styles.body}>
        <View style={[styles.badge, { backgroundColor: theme.colors.primaryContainer }]}>
          <MaterialCommunityIcons name="link-variant" size={56} color={theme.colors.primary} />
        </View>
        <Text variant="headlineSmall" style={styles.title}>
          绑定你的 ZCode
        </Text>
        <Text variant="bodyMedium" style={[styles.hint, { color: theme.colors.onSurfaceVariant }]}>
          在桌面端 ZCode 打开「连接手机」，用这里扫一扫它显示的二维码，即可远程查看任务、发送指令。
        </Text>

        <Button
          mode="contained"
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="qrcode-scan" size={size} color={color} />
          )}
          onPress={onScan}
          style={styles.primaryBtn}
          labelStyle={styles.primaryBtnLabel}
        >
          扫码绑定
        </Button>

        {onManual ? (
          <Button mode="text" onPress={onManual} textColor={theme.colors.onSurfaceVariant}>
            手动输入链接
          </Button>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  body: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
  badge: {
    width: 112,
    height: 112,
    borderRadius: 56,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  title: { textAlign: "center", marginBottom: 8 },
  hint: { textAlign: "center", lineHeight: 20, marginBottom: 32 },
  primaryBtn: { width: "100%", maxWidth: 320, paddingVertical: 4 },
  primaryBtnLabel: { fontSize: 16, letterSpacing: 0.3 },
});
