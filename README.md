# Backlog Board Accordion

A Chrome extension that enables collapsible status columns on Backlog board screens.  
Backlogのボード画面でステータス列を折りたたみ可能にするChrome拡張機能

## Overview / 概要

This extension provides functionality to individually collapse/expand status columns on Backlog project management board screens. It enables efficient screen usage for projects with many status columns.  
この拡張機能は、Backlogのプロジェクト管理ボード画面において、ステータス列を個別に折りたたみ/展開することができる機能を提供します。多くのステータス列があるプロジェクトで画面を効率的に使用できます。

## Features / 主な機能

- **Individual column collapse/expand**: Add collapse buttons to each status column header  
  **個別列の折りたたみ/展開**: 各ステータス列のヘッダーに折りたたみボタンを追加
- **State persistence**: Maintains collapse state even after browser restart  
  **状態の永続化**: ブラウザを再起動しても折りたたみ状態を保持
- **Keyboard shortcuts**:
  - `Ctrl+Shift+E`: Expand all columns / 全列を展開
  - `Ctrl+Shift+C`: Collapse all columns / 全列を折りたたみ
- **Tooltip display**: Show status name on hover for collapsed columns  
  **ツールチップ表示**: 折りたたまれた列にマウスホバーでステータス名を表示

## Supported Sites / 対応サイト

- `https://*.backlog.jp/*`
- `https://*.backlog.com/*`

## Installation / インストール方法

1. Download the latest version from the [releases page](../../releases)  
   [リリースページ](../../releases) から最新版をダウンロード
2. Open `chrome://extensions/` in Chrome browser  
   Chromeブラウザで `chrome://extensions/` を開く
3. Enable "Developer mode" in the top right  
   右上の「デベロッパーモード」をオンにする
4. Click "Load unpacked extension"  
   「パッケージ化されていない拡張機能を読み込む」をクリック
5. Select the downloaded folder  
   ダウンロードしたフォルダを選択

## Technical Specifications / 技術仕様

- **Manifest Version**: 3
- **Permissions**: `storage` (for saving settings / 設定保存用)
- **Target Pages**: Backlog board screens (URLs containing `/board/`)  
  **対象ページ**: Backlogのボード画面（`/board/`を含むURL）
- **Implementation**: TypeScript

## License / ライセンス

This project is published under the MIT License.  
このプロジェクトはMITライセンスの下で公開されています。

## Disclaimer / 注意事項

- This is an unofficial extension / この拡張機能は非公式のツールです
- May stop working due to Backlog specification changes / Backlogの仕様変更により動作しなくなる可能性があります
- Use at your own risk / 使用は自己責任でお願いします