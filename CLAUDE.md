# Amazon 在庫管理システム

## プロジェクト概要
Amazon マーケットプレイスの在庫管理を自動化するWebアプリケーション。SP-API および Tool4Seller API と連携し、在庫同期・売上分析・需要予測・FBA納品プラン作成を実現する。

## 技術スタック
- フロントエンド: Next.js 14 (App Router) / TypeScript / TailwindCSS / Recharts
- バックエンド: Node.js (Fastify) / TypeScript
- ORM: Prisma
- データベース: PostgreSQL 16 / Redis
- ジョブキュー: BullMQ
- 認証: NextAuth.js
- テスト: Vitest

## Bashコマンド
- npm run dev: 開発サーバー起動
- npm run build: ビルド
- npm run test: テスト実行
- npm run typecheck: TypeScript型チェック
- npm run lint: ESLint実行
- npx prisma migrate dev: DBマイグレーション

## コードスタイル
- ES Modules (import/export) を使用
- TypeScript strict モード
- ファイル名はケバブケース: inventory-service.ts
- コンポーネント名はパスカルケース: InventoryDashboard.tsx

## Tool4Seller API仕様
- ベースURL: https://das-server.tool4seller.com/api/
- 認証: HTTP Header TS-API-KEY
- レートリミット: クォータ30、5秒で1クォータ回復
- エンドポイント: /api/sales, /api/inventories, /api/inbound-shipments, /api/inbound-shipments/item

## IMPORTANT
- 全ての外部APIキーは環境変数から読み込み。ハードコード絶対禁止
- コミット前に必ず npm run typecheck と npm run lint を実行
- 外部API呼び出しにはリトライとタイムアウト(30秒)を実装
