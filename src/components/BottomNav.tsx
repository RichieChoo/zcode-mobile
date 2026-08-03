import React from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { router } from "expo-router";
import { useTheme } from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

type Tab = "links" | "workspace";

interface Props {
  /** 当前高亮的 tab。 */
  active: Tab;
  /** 打开工作台（已有激活会话则进 remote，否则进扫码）。 */
  onOpenWorkspace: () => void;
}

/** 共享底部导航：链接 / 工作台。紧凑高度，首页与工作台页复用。 */
export function BottomNav({ active, onOpenWorkspace }: Props) {
  const theme = useTheme();
  return (
    <SafeAreaView
      edges={["bottom"]}
      style={[styles.root, { borderTopColor: theme.colors.outline, backgroundColor: theme.colors.surface }]}
    >
      <View style={styles.row}>
        <NavItem
          active={active === "links"}
          icon="link-variant"
          label="链接"
          onPress={() => router.replace("/")}
        />
        <NavItem
          active={active === "workspace"}
          icon="monitor-dashboard"
          label="工作台"
          onPress={onOpenWorkspace}
        />
      </View>
    </SafeAreaView>
  );
}

function NavItem({
  active,
  icon,
  label,
  onPress,
}: {
  active: boolean;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>["name"];
  label: string;
  onPress: () => void;
}) {
  const theme = useTheme();
  const color = active ? theme.colors.primary : theme.colors.onSurfaceVariant;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.navItem, pressed && { backgroundColor: theme.colors.surfaceVariant }]}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
    >
      <MaterialCommunityIcons name={icon} size={20} color={color} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { borderTopWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", height: 52 },
  navItem: { flex: 1, alignItems: "center", justifyContent: "center" },
});
