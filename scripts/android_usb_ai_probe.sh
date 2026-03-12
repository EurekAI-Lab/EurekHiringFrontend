#!/usr/bin/env bash

set -euo pipefail

ADB_BIN="${ADB_BIN:-/home/a/Android/Sdk/platform-tools/adb}"
OUT_DIR="${1:-./tmp/android-usb-ai-probe}"
mkdir -p "$OUT_DIR"

if [ ! -x "$ADB_BIN" ]; then
  echo "adb not found: $ADB_BIN" >&2
  exit 1
fi

echo "[probe] using adb: $ADB_BIN"
"$ADB_BIN" start-server >/dev/null

DEVICES="$("$ADB_BIN" devices -l)"
echo "$DEVICES" | tee "$OUT_DIR/devices.txt"

if ! echo "$DEVICES" | tail -n +2 | grep -q "device"; then
  echo "[probe] no authorized android device found"
  echo "[probe] check USB debugging, trust prompt, and cable" >&2
  exit 2
fi

SERIAL="${ANDROID_SERIAL:-$("$ADB_BIN" devices | awk 'NR>1 && $2=="device" {print $1; exit}')}"
echo "[probe] serial: $SERIAL"

"$ADB_BIN" -s "$SERIAL" shell getprop ro.product.model | tee "$OUT_DIR/device-model.txt"
"$ADB_BIN" -s "$SERIAL" shell dumpsys activity top > "$OUT_DIR/activity-top.txt" || true
"$ADB_BIN" -s "$SERIAL" shell dumpsys window windows > "$OUT_DIR/window-state.txt" || true
"$ADB_BIN" -s "$SERIAL" logcat -d -v threadtime > "$OUT_DIR/logcat.txt" || true

echo "[probe] artifacts written to $OUT_DIR"
echo "[probe] next:"
echo "  1. open chrome://inspect on this machine"
echo "  2. inspect the app WebView target"
echo "  3. open AI page with ?diag=1 to capture runtime diagnostics"
