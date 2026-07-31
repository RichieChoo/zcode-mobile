import React, { useEffect, useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, StyleSheet, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  Appbar,
  Button,
  Text,
  TextInput,
  useTheme,
} from "react-native-paper";
import { SafeAreaView } from "react-native-safe-area-context";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

import { parseRemoteUrl } from "../src/lib/parseRemoteUrl";
import { makeId } from "../src/lib/id";
import { useAppStore } from "../src/store/appStore";
import type { ParsedRemoteUrl } from "../src/lib/types";

/**
 * 扫码绑定页：默认用相机实时识别桌面端二维码；
 * 支持从 ?manual=1 进入「手动输入链接」模式。
 */
export default function ScanScreen() {
  const params = useLocalSearchParams<{ manual?: string }>();
  const theme = useTheme();
  const addSession = useAppStore((s) => s.addSession);

  const [permission, requestPermission] = useCameraPermissions();
  const [manualMode, setManualMode] = useState(params.manual === "1");
  const [manualText, setManualText] = useState("");
  const [parsed, setParsed] = useState<ParsedRemoteUrl | null>(null);

  // 200ms 防抖：避免对同一二维码连续触发多次。
  const lastScanRef = React.useRef<{ text: string; at: number }>({ text: "", at: 0 });

  useEffect(() => {
    if (!manualMode) requestPermission();
  }, [manualMode, requestPermission]);

  const handleRaw = (raw: string): ParsedRemoteUrl => {
    const result = parseRemoteUrl(raw);
    setParsed(result);
    return result;
  };

  const confirmBind = async (info: ParsedRemoteUrl) => {
    if (!info.valid) {
      Alert.alert("无法识别", "这不是一条 ZCode 远程链接，请确认二维码来源。");
      return;
    }
    await addSession({
      id: makeId(),
      name: info.name ?? "ZCode 设备",
      url: info.url,
      boundAt: Date.now(),
    });
    if (router.canGoBack()) router.back();
    else router.replace("/");
  };

  const onScanned = (data: string) => {
    const now = Date.now();
    if (data === lastScanRef.current.text && now - lastScanRef.current.at < 1500) return;
    lastScanRef.current = { text: data, at: now };
    const info = handleRaw(data);
    if (info.valid) {
      // 扫到有效链接：弹确认，避免误绑。
      Alert.alert(
        "已识别链接",
        `设备：${info.name ?? "未知"}\n${info.url}`,
        [
          { text: "取消", style: "cancel", onPress: () => setParsed(null) },
          { text: "绑定", onPress: () => confirmBind(info) },
        ],
        { cancelable: true },
      );
    }
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: theme.colors.background }]} edges={["top"]}>
      <Appbar.Header>
        <Appbar.BackAction onPress={() => (router.canGoBack() ? router.back() : router.replace("/"))} />
        <Appbar.Content title={manualMode ? "手动输入链接" : "扫码绑定"} />
        <Appbar.Action
          icon={({ size, color }) => (
            <MaterialCommunityIcons
              name={manualMode ? "qrcode-scan" : "pencil-outline"}
              size={size}
              color={color}
            />
          )}
          onPress={() => {
            setManualMode((m) => !m);
            setParsed(null);
          }}
          accessibilityLabel={manualMode ? "切换到扫码" : "切换到手动输入"}
        />
      </Appbar.Header>

      {manualMode ? (
        <View style={styles.manual}>
          <TextInput
            label="粘贴 ZCode 远程链接"
            value={manualText}
            onChangeText={(t) => {
              setManualText(t);
              setParsed(handleRaw(t));
            }}
            multiline
            numberOfLines={4}
            mode="outlined"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
          {parsed && !parsed.valid ? (
            <Text variant="bodySmall" style={{ color: theme.colors.error, marginTop: 8 }}>
              不是有效的 ZCode 远程链接（应类似 https://zcode.z.ai/remote/...）
            </Text>
          ) : null}
          <Button
            mode="contained"
            disabled={!parsed?.valid}
            onPress={() => parsed && confirmBind(parsed)}
            style={styles.bindBtn}
          >
            绑定
          </Button>
        </View>
      ) : permission?.granted ? (
        <View style={styles.flex}>
          <CameraView
            barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
            onBarcodeScanned={(res) => onScanned(res.data)}
            style={styles.flex}
          />
          <View style={styles.scanHint}>
            <MaterialCommunityIcons name="qrcode-scan" size={28} color="#fff" />
            <Text variant="bodyMedium" style={{ color: "#fff", marginTop: 8 }}>
              将桌面端 ZCode「连接手机」里的二维码对准取景框
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.permission}>
          <MaterialCommunityIcons name="camera-off-outline" size={48} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={{ color: theme.colors.onSurfaceVariant, marginTop: 12 }}>
            需要相机权限才能扫码绑定
          </Text>
          <Button mode="contained" onPress={requestPermission} style={{ marginTop: 16 }}>
            授予相机权限
          </Button>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
  manual: { padding: 16, gap: 8 },
  bindBtn: { marginTop: 16, paddingVertical: 4 },
  scanHint: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 48,
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    borderRadius: 16,
    padding: 16,
  },
  permission: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 },
});
