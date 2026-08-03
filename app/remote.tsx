import React, { useRef } from "react";
import { Redirect, router } from "expo-router";
import { Share, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";

import { WebToolbar, dispatchRefreshMessage } from "../src/components/WebToolbar";
import { selectActiveSession, useAppStore } from "../src/store/appStore";
import type { RefreshMessage } from "../src/lib/zcodeRefresh";

/** 当前链接的远端工作台，保留既有 WebView 行为，只将入口从链接管理页显式打开。 */
export default function RemoteScreen() {
  const session = useAppStore(selectActiveSession);
  if (!session) {
    return <Redirect href="/" />;
  }
  return <ZCodeWebView key={session.id} url={session.url} title={session.name} />;
}

function ZCodeWebView({ url, title }: { url: string; title: string }) {
  const webRef = useRef<WebView>(null);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);

  const onMessage = (event: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(event.nativeEvent.data) as RefreshMessage;
      if (data?.kind === "refresh") dispatchRefreshMessage(data);
    } catch {
      // 忽略非刷新消息。
    }
  };

  const onShare = async () => {
    try {
      await Share.share({ message: url, url });
    } catch {
      // 用户取消分享时不显示错误。
    }
  };

  return <View style={styles.flex}>
    <WebToolbar
      title={title}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      onInject={(script) => webRef.current?.injectJavaScript(script)}
      onReload={() => webRef.current?.reload()}
      onBack={() => webRef.current?.goBack()}
      onForward={() => webRef.current?.goForward()}
      onHome={() => router.replace("/")}
      onShare={onShare}
      onOpenSettings={() => router.push("/settings")}
    />
    <WebView
      ref={webRef}
      source={{ uri: url }}
      onMessage={onMessage}
      onNavigationStateChange={(navigation: WebViewNavigation) => {
        setCanGoBack(navigation.canGoBack);
        setCanGoForward(navigation.canGoForward);
      }}
      javaScriptEnabled
      domStorageEnabled
      startInLoadingState
      allowsBackForwardNavigationGestures
      sharedCookiesEnabled
      userAgent="ZCodeMobile/1.0 (Android; WebView)"
      style={styles.flex}
    />
  </View>;
}

const styles = StyleSheet.create({ flex: { flex: 1 } });
