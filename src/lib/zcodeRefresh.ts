/**
 * 注入 ZCode remote 页面的 JavaScript：定位并点击「刷新工作区和任务」按钮。
 *
 * 调研结论（已用浏览器在 https://zcode.z.ai/remote/v4 实测）：
 *  - remote 页面「更多」菜单点开后是一个「ZCode 远程控制」概览页，其中有
 *    「刷新工作区和任务」按钮，点击会重新拉取当前桌面设备上所有工作区/任务状态。
 *  - 该按钮没有稳定的 data-testid，但 aria-label / 文案稳定，可据此定位：
 *      getByRole("button", { name: /刷新工作区和任务/ })
 *    在 WebView 里没有 Playwright，用 querySelectorAll + 文本匹配等价实现。
 *
 * 注入后会通过 window.ReactNativeWebView.postMessage 回传一个 JSON 字符串：
 *   { kind: "refresh", result: "refreshed" | "navigating" | "not-found" | "error", msg?: string }
 *
 * 回传结果含义：
 *  - refreshed   ：已找到并点击刷新按钮（最理想路径）。
 *  - navigating  ：当前不在概览页，已先点「更多」跳转，稍后会自动点刷新（异步）。
 *  - not-found   ：页面结构异常或未加载完成，建议上层用 reload() 兜底。
 *  - error       ：注入脚本自身抛错。
 */
export const ZCODE_REFRESH_JS = `
(function () {
  try {
    var POST = function (result, msg) {
      try {
        window.ReactNativeWebView.postMessage(JSON.stringify({ kind: "refresh", result: result, msg: msg || "" }));
      } catch (e) {}
    };

    var findButton = function (matcher) {
      var buttons = Array.from(document.querySelectorAll("button, [role='button'], a"));
      for (var i = 0; i < buttons.length; i++) {
        var b = buttons[i];
        var label = b.getAttribute("aria-label") || "";
        var text = (b.textContent || "").replace(/\\s+/g, "");
        if (matcher(label, text)) return b;
      }
      return null;
    };

    var findRefresh = function () {
      return findButton(function (label, text) {
        return /刷新工作区和任务/.test(label) || /刷新工作区和任务/.test(text);
      });
    };

    var refreshBtn = findRefresh();
    if (refreshBtn) {
      refreshBtn.click();
      POST("refreshed");
      return;
    }

    // 不在概览页：先点「更多」回到「ZCode 远程控制」概览页，再点刷新。
    var moreBtn = findButton(function (label, text) {
      return label === "更多";
    });
    if (moreBtn) {
      moreBtn.click();
      // 概览页是前端路由跳转，留出渲染时间再找刷新按钮。
      setTimeout(function () {
        var r = findRefresh();
        if (r) {
          r.click();
          POST("refreshed");
        } else {
          POST("not-found", "已进入远程控制页，但未找到刷新按钮");
        }
      }, 700);
      POST("navigating");
      return;
    }

    POST("not-found", "未找到「更多」或「刷新」按钮");
  } catch (e) {
    try {
      window.ReactNativeWebView.postMessage(JSON.stringify({ kind: "refresh", result: "error", msg: String(e) }));
    } catch (_) {}
  }
})();
true;
`;

/** 页面侧发回 App 的刷新结果消息体。 */
export type RefreshMessage = {
  kind: "refresh";
  result: "refreshed" | "navigating" | "not-found" | "error";
  msg?: string;
};
