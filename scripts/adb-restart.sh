#!/usr/bin/env bash
# 每次构建前自动重启 adb daemon，规避 daemon 卡死导致 Expo 用 SIGTERM 杀进程的问题。
# 同时确保 JAVA_HOME 指向 JDK 17（RN 0.76 / AGP 8.x 的硬性要求）。
set -e

# 1) JAVA_HOME：优先用 brew 的 openjdk@17，否则回退到 /usr/libexec/java_home。
if [ -z "$JAVA_HOME" ] || [ ! -d "$JAVA_HOME" ]; then
  BREW_JDK17="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
  if [ -d "$BREW_JDK17" ]; then
    export JAVA_HOME="$BREW_JDK17"
  else
    SYSTEM_JH="$(/usr/libexec/java_home 2>/dev/null || true)"
    [ -n "$SYSTEM_JH" ] && export JAVA_HOME="$SYSTEM_JH"
  fi
fi
echo "[adb-restart] JAVA_HOME=$JAVA_HOME"

# 2) 找到 adb：优先 ANDROID_SDK_ROOT/platform-tools，再回退 PATH。
ADB="${ANDROID_SDK_ROOT:-$ANDROID_HOME}/platform-tools/adb"
[ -x "$ADB" ] || ADB="$(command -v adb || true)"
if [ -z "$ADB" ]; then
  echo "[adb-restart] 未找到 adb，跳过重启"
  exit 0
fi

# 3) kill + start，忽略「daemon not running」之类的正常输出。
echo "[adb-restart] 重启 adb: $ADB"
"$ADB" kill-server >/dev/null 2>&1 || true
"$ADB" start-server >/dev/null 2>&1 || true
"$ADB" devices -l
