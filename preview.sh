#!/usr/bin/env bash
#
# preview.sh — 构建全部工具并用单个静态服务器统一预览。
#
# 把导航页（本分支）和各工具的 dist/ 组装成线上同样的相对路径结构
# (导航页在根，各工具在 ./sd-trans/ ./img-compare/ ./emotes/)，
# 这样从导航页点进各工具的相对跳转和真实部署一致。
#
# 自动适配两种本地布局：
#   - submodule：工具是本目录下的子目录（main/sd-trans/ ...）
#   - 并列工作区：工具是本目录的同级目录（../sd-trans/ ...）
#
# 用法:
#   ./preview.sh                # 构建全部并启动预览
#   ./preview.sh --no-build     # 跳过构建，直接用现有 dist/ 启动
#   ./preview.sh --port 8080    # 指定端口（默认 4180）
#   ./preview.sh sd-trans       # 只构建指定工具（其余沿用现有 dist/）

set -euo pipefail

SELF_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD_ROOT="${TMPDIR:-/tmp}/tool-pages-preview"

# 导航页就是脚本所在目录；其余工具按导航页的相对路径放进子目录。
SUB_TOOLS=(sd-trans img-compare emotes)

PORT=4180
DO_BUILD=1
SELECTED=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --no-build) DO_BUILD=0; shift ;;
    --port) PORT="$2"; shift 2 ;;
    --port=*) PORT="${1#*=}"; shift ;;
    -h|--help)
      sed -n '2,21p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) SELECTED+=("$1"); shift ;;
  esac
done

# 定位某个工具的源码目录：优先本目录下的子目录（submodule），
# 否则回退到同级目录（并列工作区）。stdout 输出路径，找不到返回非 0。
tool_dir() {
  local name="$1"
  if [[ -f "$SELF_DIR/$name/package.json" ]]; then
    echo "$SELF_DIR/$name"
  elif [[ -f "$SELF_DIR/../$name/package.json" ]]; then
    ( cd "$SELF_DIR/../$name" && pwd )
  else
    return 1
  fi
}

build_one() {
  local name="$1" dir
  if ! dir="$(tool_dir "$name")"; then
    echo "✗ 找不到工具 $name（子目录和同级目录都没有）" >&2
    exit 1
  fi
  echo "▶ 构建 $name ..."
  ( cd "$dir" && npm run build )
}

# 决定要构建哪些工具：未指定则全部（导航页 + 工具），指定了则只构建选中的。
if [[ $DO_BUILD -eq 1 ]]; then
  if [[ ${#SELECTED[@]} -gt 0 ]]; then
    for name in "${SELECTED[@]}"; do
      if [[ "$name" == "main" || "$name" == "." ]]; then
        echo "▶ 构建 导航页 ..."; ( cd "$SELF_DIR" && npm run build )
      else
        build_one "$name"
      fi
    done
  else
    echo "▶ 构建 导航页 ..."; ( cd "$SELF_DIR" && npm run build )
    for name in "${SUB_TOOLS[@]}"; do build_one "$name"; done
  fi
fi

# 组装预览根目录。
echo "▶ 组装预览目录 $BUILD_ROOT ..."
rm -rf "$BUILD_ROOT"
mkdir -p "$BUILD_ROOT"

if [[ ! -d "$SELF_DIR/dist" ]]; then
  echo "✗ 导航页 dist 不存在，请先构建（去掉 --no-build）" >&2
  exit 1
fi
cp -r "$SELF_DIR/dist/." "$BUILD_ROOT/"

for name in "${SUB_TOOLS[@]}"; do
  dir="$(tool_dir "$name")" || { echo "✗ 找不到工具 $name" >&2; exit 1; }
  if [[ ! -d "$dir/dist" ]]; then
    echo "✗ $name/dist 不存在，请先构建（去掉 --no-build）" >&2
    exit 1
  fi
  mkdir -p "$BUILD_ROOT/$name"
  cp -r "$dir/dist/." "$BUILD_ROOT/$name/"
done

echo
echo "✓ 预览就绪: http://localhost:$PORT/"
echo "    导航页      http://localhost:$PORT/"
for name in "${SUB_TOOLS[@]}"; do
  echo "    $name$(printf '%*s' $((14 - ${#name})) '')http://localhost:$PORT/$name/"
done
echo "  (Ctrl+C 停止)"
echo

exec python3 -m http.server "$PORT" --directory "$BUILD_ROOT"
