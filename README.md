# ZCode Mobile

一个移动端壳应用（**Android + iOS 双平台**），用于嵌入 **ZCode 远程 Web 控制台**：扫码绑定桌面端 ZCode，在手机上查看任务、发送指令，并一键触发 ZCode 的「刷新工作区与任务」能力。

> 本应用仅作为远程 Web 壳，所有任务数据与 Agent 执行仍在桌面端 ZCode 完成。

## 核心能力

| 能力 | 说明 |
| --- | --- |
| 扫码绑定 | 首启动空状态，主按钮扫码识别桌面端二维码（二维码内容即 `https://zcode.z.ai/remote/v4?sid=...` 形式的链接） |
| 远程交互 | 用 WebView 加载绑定链接，正常使用 ZCode remote 的全部交互 |
| **一键刷新** | 顶部「刷新」按钮注入 JS，触发页面内「刷新工作区和任务」，重新拉取设备上的工作区/任务；找不到则自动 `reload()` 兜底 |
| 浏览导航 | 后退 / 前进 / 回到首页 / 分享当前链接 |
| 多会话 | 保存多个桌面/设备连接，随时切换、删除 |
| 外观配置 | 主题（跟随系统/浅色/深色，Material You）、横竖屏锁定、全屏沉浸式 |

## 技术栈

- **React Native + Expo**（SDK 52，New Architecture）
- **expo-router** 文件式路由
- **react-native-webview** 嵌入 ZCode Web
- **expo-camera** 二维码识别
- **react-native-paper** Material 3 风格 UI
- **zustand + AsyncStorage** 持久化会话与外观配置

## 目录结构

```
app/                      # expo-router 路由页
  _layout.tsx             # 根布局：Provider / 主题 / 路由栈
  index.tsx               # 首页：空状态 或 WebView 承载页
  scan.tsx                # 扫码绑定 / 手动输入链接
  settings.tsx            # 设置：会话管理 + 外观
src/
  components/
    EmptyState.tsx        # 首启动空状态
    SessionCard.tsx       # 会话卡片
    WebToolbar.tsx        # WebView 顶部工具栏（含刷新）
  hooks/useAppearance.ts  # 主题/横竖屏/全屏 驱动
  lib/
    parseRemoteUrl.ts     # 解析 + 校验 remote 链接
    zcodeRefresh.ts       # ★ 注入页面的刷新 JS（核心）
    types.ts / id.ts
  store/appStore.ts       # zustand 全局状态 + 持久化
  theme/material3.ts      # Material You 配色
```

## 本地开发

前置：Node 18+、**JDK 17**（RN 0.76 / AGP 8.x 要求）、Android SDK（含 NDK 27+）、已配置好 adb 的 Android 开发环境。

```bash
# 安装依赖
npm install

# 生成 Android 原生工程（首次或修改了原生配置后执行）
npx expo prebuild --platform android

# 在已连接的 Android 设备/模拟器上运行
npm run android

# 或用 Expo Go 开发（热重载）
npm start
```

### 构建注意事项（踩坑记录）

- **JDK 必须 17**：`JAVA_HOME` 指向 JDK 17，`expo run:android` 会因 AGP 8.x 在 JDK 11 下失败。
- **NDK 版本**：`app.json` 已通过 `expo-build-properties` 固化 `ndkVersion=27.1.12297006`（本机已安装该版本）。若用其他版本需先 `sdkmanager --install "ndk;<版本>"`。
- **Kotlin 版本**：固化 `kotlinVersion=1.9.25`，解决 expo-modules-core 的 Compose Compiler 1.5.15 与 Kotlin 1.9.24 的版本冲突。
- **support 库冲突**：expo-camera → cameraview 依赖古 `com.android.support:25.3.1`，与 androidx 冲突。`expo prebuild` 后需在 `android/build.gradle` 的 `allprojects` 里加如下排除（见 `git log` 中 "fix: android build" 提交）：

```gradle
allprojects {
    configurations.configureEach {
        exclude group: 'com.android.support', module: 'support-v4'
        exclude group: 'com.android.support', module: 'support-compat'
        exclude group: 'com.android.support', module: 'support-media-compat'
        exclude group: 'com.android.support', module: 'support-core-utils'
        exclude group: 'com.android.support', module: 'support-core-ui'
        exclude group: 'com.android.support', module: 'support-fragment'
        exclude group: 'com.android.support', module: 'support-annotations'
        exclude group: 'com.android.support', module: 'appcompat-v7'
    }
}
```

- **adb 版本冲突**：本机曾同时存在 adb 36（brew cask）与 adb 37（commandlinetools），导致 daemon 反复被杀。已删除 `/opt/homebrew/bin/adb` 软链，全系统统一 adb 37。若再遇到 `daemon not running` 反复出现，检查 `which -a adb` 是否只有一个版本。

> 相机权限：首次进入扫码页会请求相机权限，授予后即可扫描桌面端 ZCode 的「连接手机」二维码。

## 使用流程

1. 在桌面端 ZCode 打开「连接手机」，获得二维码（内容是一条 `https://zcode.z.ai/remote/...` 链接）。
2. 在 App 首页点击 **扫码绑定**，对准二维码。
3. 识别成功后确认绑定，自动进入 ZCode 远程界面，正常交互。
4. 顶部 **刷新** 按钮一键重新拉取工作区与任务状态；**设置** 里可管理多个会话、切换主题/横竖屏/全屏。

## 刷新能力的实现说明

桌面 ZCode 的 remote 页面在「更多 → ZCode 远程控制」概览页中有一个 **「刷新工作区和任务」** 按钮，点击会重新拉取当前设备上所有工作区/任务的最新状态。App 的「刷新」按钮通过 `WebView.injectJavaScript` 在页面内定位并点击该按钮（按 `aria-label`/文案 `/刷新工作区和任务/` 匹配）；若当前不在概览页，则先点击「更多」跳转再触发刷新；若页面结构异常或未加载完成，则回退到整页 `reload()`，并通过 Snackbar 反馈结果。

## 打包 APK

```bash
# 方式一：EAS Build（推荐，无需本地 Android 环境）
npm i -g eas-cli
eas login
eas build --platform android --profile preview

# 方式二：本地 Gradle 打包
cd android
./gradlew assembleRelease
# 产物：android/app/build/outputs/apk/release/app-release.apk
```

## iOS 运行与打包

iOS 同样已适配（相机权限、屏幕方向、状态栏行为均已处理）。

```bash
# 生成 iOS 原生工程（首次或修改原生配置后执行）
npx expo prebuild --platform ios

# 安装 Pods（首次或新增原生依赖后执行）
cd ios && pod install && cd ..

# 在模拟器/真机上运行
npm run ios
# 或：npx expo run:ios --device  # 连接的真机
```

打包 IPA：

```bash
# 方式一：EAS Build
eas build --platform ios --profile preview

# 方式二：本地 Xcode
# 打开 ios/ZCode.xcworkspace，选择目标设备/Archive，导出 IPA
```

iOS 注意事项：
- 相机扫码需真机或支持摄像头的模拟器；首次会弹 `NSCameraUsageDescription` 授权。
- 屏幕方向锁在 iOS 上：自动 = 不锁（`ALL`）、竖屏 = `PORTRAIT_UP`、横屏 = `LANDSCAPE`（左右均可）。
- WebView 在 iOS（WKWebView）与 Android（Chromium）行为略有差异，但 ZCode remote 页面两端均支持。

## 备注

- 桌面端二维码的实际内容按「= remote URL」处理（已从 remote 页面文案与 URL 结构验证）；若实际为 JSON 或短链，`parseRemoteUrl` 会做兼容解析。
- 二维码有时效性（失效后需回到桌面端重新连接），可在「设置」里删除旧会话并重新扫码绑定。
