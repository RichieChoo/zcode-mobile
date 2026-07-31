import React, { useRef } from "react";
import { router } from "expo-router";
import { Share, StyleSheet, View } from "react-native";
import { WebView, type WebViewMessageEvent, type WebViewNavigation } from "react-native-webview";

import { EmptyState } from "../src/components/EmptyState";
import {
  WebToolbar,
  type WebToolbarHandle,
  dispatchRefreshMessage,
} from "../src/components/WebToolbar";
import { selectActiveSession, useAppStore } from "../src/store/appStore";
import type { RefreshMessage } from "../src/lib/zcodeRefresh";

/**
 * 首页：无会话 → 空状态引导扫码；有会话 → 用 WebView 加载 ZCode remote。
 * 顶部工具栏提供后退/前进/首页/刷新/分享/设置。
 */
export default function HomeScreen() {
  const session = useAppStore(selectActiveSession);
  const setActive = useAppStore((s) => s.setActive);

  if (!session) {
    return (
      <EmptyState
        onScan={() => router.push("/scan")}
        onManual={() => router.push({ pathname: "/scan", params: { manual: "1" } })}
      />
    );
  }
  return <ZCodeWebView key={session.id} url={session.url} title={session.name} />;
}

function ZCodeWebView({ url, title }: { url: string; title: string }) {
  const webRef = useRef<WebView>(null);
  const toolbarRef = useRef<WebToolbarHandle>(null);
  const [canGoBack, setCanGoBack] = React.useState(false);
  const [canGoForward, setCanGoForward] = React.useState(false);
  const homeUrlRef = useRef(url);

  const inject = (js: string) => webRef.current?.injectJavaScript(js);
  const reload = () => webRef.current?.reload();

  const onMessage = (e: WebViewMessageEvent) => {
    try {
      const data = JSON.parse(e.nativeEvent.data) as RefreshMessage;
      if (data?.kind === "refresh") dispatchRefreshMessage(data);
    } catch {
      /* 忽略非刷新消息 */
    }
  };

  const onNavStateChange = (nav: WebViewNavigation) => {
    setCanGoBack(nav.canGoBack);
    setCanGoForward(nav.canGoForward);
  };

  const onShare = async () => {
    try {
      await Share.share({ message: url, url });
    } catch {
      /* 用户取消等，忽略 */
    }
  };

  return (
    <View style={styles.flex}>
      <WebToolbar
        ref={toolbarRef}
        title={title}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        onInject={inject}
        onReload={reload}
        onBack={() => webRef.current?.goBack()}
        onForward={() => webRef.current?.goForward()}
        onHome={() => webRef.current?.injectJavaScript(`(function(){location.href=${JSON.stringify(homeUrlRef.current)};})();true;`)}
        onShare={onShare}
        onOpenSettings={() => router.push("/settings")}
      />
      <WebView
        ref={webRef}
        source={{ uri: url }}
        onMessage={onMessage}
        onNavigationStateChange={onNavStateChange}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
        allowsBackForwardNavigationGestures
        sharedCookiesEnabled
        // 让 zcode 知道这是个移动端 WebView，便于它下发移动端 UI。
        userAgent="ZCodeMobile/1.0 (Android; WebView)"
        style={styles.flex}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
});
