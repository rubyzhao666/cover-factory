This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## 30 秒本地启动

1) 复制环境变量模板：

```bash
cp .env.local.example .env.local
```

2) 填写 `.env.local` 中的真实 key（Supabase / SiliconFlow / 虎皮椒）。

3) 安装依赖并启动：

```bash
npm install
npm run dev
```

4) 打开本地地址：

- http://localhost:3000
- http://localhost:3000/auth/login
- http://localhost:3000/generate
- http://localhost:3000/pricing
- http://localhost:3000/api/payment/callback

## 上线前检查清单

- [ ] 本地 `npm run build` 通过，无报错
- [ ] 生产环境变量已配置完整：
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SILICONFLOW_API_KEY`
  - [ ] `XUNHU_APP_ID`
  - [ ] `XUNHU_APP_SECRET`
  - [ ] `XUNHU_NOTIFY_URL`（线上域名 + `/api/payment/callback`）
  - [ ] `XUNHU_RETURN_URL`（线上域名 + 返回页）
  - [ ] `XUNHU_PAY_SECRET`
- [ ] Supabase 生产库表结构已同步（用户、订单、积分等）
- [ ] 支付回调白名单/配置已指向线上回调地址
- [ ] 支付完成后积分到账链路已在测试环境验证
- [ ] 登录/注册/生成/支付四条主流程已人工回归
- [ ] 域名可访问且 HTTPS 正常
- [ ] 至少准备一个回滚方案（上一个可用版本）

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
