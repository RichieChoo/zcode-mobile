import React, { forwardRef, useImperativeHandle, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { IconButton, Snackbar, Text, useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { ZCODE_REFRESH_JS, type RefreshMessage } from "../lib/zcodeRefresh";

export interface WebToolbarHandle {
  /** 触发 zcode 的「刷新工作区和任务」（注入 JS；找不到则由 reload 兜底）。 */
  refresh: () => void;
  /** 纯 WebView reload 兜底。 */
  hardReload: () => void;
}

interface Props {
  title: string;
  canGoBack: boolean;
  canGoForward: boolean;
  /** 注入 JS 到当前 WebView。 */
  onInject: (js: string) => void;
  onReload: () => void;
  onBack: () => void;
  onForward: () => void;
  onShare: () => void;
  onHome: () => void;
  onOpenSettings: () => void;
}

const REFRESH_HINT: Record<RefreshMessage["result"], string> = {
  refreshed: "已刷新工作区与任务",
  navigating: "正在打开远程控制页…",
  "not-found": "未找到刷新按钮，已重载页面",
  error: "刷新失败，已重载页面",
};

/**
 * WebView 顶部工具栏：标题 + 后退/前进/首页/刷新/分享/设置。
 * 「刷新」= 一键触发 zcode 页面内的「刷新工作区和任务」按钮。
 *
 * 工具栏与 WebView 承载页之间通过 dispatchRefreshMessage 单例桥接传递刷新结果：
 * 承载页在 WebView onMessage 里把解析后的消息 dispatch 进来，工具栏据此显示反馈
 * 并在 not-found/error 时触发整页 reload 兜底。
 */
export const WebToolbar = forwardRef<WebToolbarHandle, Props>(function WebToolbar(
  { title, canGoBack, canGoForward, onInject, onReload, onBack, onForward, onShare, onHome, onOpenSettings },
  ref,
) {
  const theme = useTheme();
  const [toast, setToast] = React.useState<string | null>(null);
  const onReloadRef = useRef(onReload);
  onReloadRef.current = onReload;

  const showToast = (msg: string) => setToast(msg);

  // 把「处理刷新结果」的逻辑注册到单例桥，供承载页的 onMessage 调用。
  WebToolbarBridge.handler = (msg: RefreshMessage) => {
    if (msg.result === "not-found" || msg.result === "error") {
      onReloadRef.current(); // 兜底：整页重载
    }
    showToast(REFRESH_HINT[msg.result]);
  };

  useImperativeHandle(ref, () => ({
    refresh() {
      onInject(ZCODE_REFRESH_JS);
    },
    hardReload() {
      onReload();
    },
  }));

  return (
    <SafeAreaView
      edges={["top"]}
      style={[styles.root, { backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.row}>
        <IconButton
          disabled={!canGoBack}
          onPress={onBack}
          icon={({ size, color }) => (
            <MaterialCommunityIcons name="arrow-left" size={size} color={color} />
          )}
          accessibilityLabel="后退"
        />
        <Text variant="titleMedium" numberOfLines={1} style={styles.title}>
          {title}
        </Text>
        <View style={styles.right}>
          <IconButton
            disabled={!canGoForward}
            onPress={onForward}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="arrow-right" size={size} color={color} />
            )}
            accessibilityLabel="前进"
          />
          <IconButton
            onPress={onHome}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="home-outline" size={size} color={color} />
            )}
            accessibilityLabel="回到首页"
          />
          <IconButton
            onPress={() => onInject(ZCODE_REFRESH_JS)}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="refresh" size={size} color={theme.colors.primary} />
            )}
            accessibilityLabel="刷新工作区与任务"
          />
          <IconButton
            onPress={onShare}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="share-variant-outline" size={size} color={color} />
            )}
            accessibilityLabel="分享链接"
          />
          <IconButton
            onPress={onOpenSettings}
            icon={({ size, color }) => (
              <MaterialCommunityIcons name="cog-outline" size={size} color={color} />
            )}
            accessibilityLabel="设置"
          />
        </View>
      </View>
      <Snackbar
        visible={toast !== null}
        onDismiss={() => setToast(null)}
        duration={1500}
        style={{ backgroundColor: theme.colors.inverseSurface }}
      >
        <Text style={{ color: theme.colors.inverseOnSurface }}>{toast ?? ""}</Text>
      </Snackbar>
    </SafeAreaView>
  );
});

/**
 * 轻量单例桥接：WebView 承载页解析 onMessage 得到刷新结果后调用 dispatchRefreshMessage，
 * 工具栏据此显示反馈并在 not-found/error 时触发 reload 兜底。单实例工具栏场景下足够用。
 */
const WebToolbarBridge = {
  handler: null as null | ((msg: RefreshMessage) => void),
};

export const dispatchRefreshMessage = (msg: RefreshMessage) => {
  WebToolbarBridge.handler?.(msg);
};

const styles = StyleSheet.create({
  root: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(150,160,170,0.3)",
  },
  row: { flexDirection: "row", alignItems: "center", paddingRight: 4, height: 56 },
  title: { flex: 1, marginLeft: 4, fontWeight: "600" },
  right: { flexDirection: "row", alignItems: "center" },
});
