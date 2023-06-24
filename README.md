# MemberShip Blog App

ブログアプリケーションです。
メンバーシップ機能があり、ユーザーはメンバーシップの作成を
することができ、参加ユーザー向けの投稿をすることができます。

## 構成
- Next.js version 13.4.3
- Supabase
- Supabase Auth
- Supabase Storage
- Stripe


## supabase 連携

### 連携開始
```sh
npx supabase login
```
アクセストークンの生成して、ターミナルで入力

### 初期化
```sh
npx supabase init

npx supabase link --project-ref xxx ## supabase Dashboard -> General settings -> GeneralReference ID
```

### 型生成
```sh

npx supabase gen types typescript --linked > xxx.ts  ## 任意のファイル 例: src/app/_utils/database.types.ts
```
