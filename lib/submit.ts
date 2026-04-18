// 简单的内存存储（演示用）
// 生产环境请使用：Upstash Redis / Cloudflare D1 / Vercel Postgres
import { nanoid } from 'nanoid';
import type { RecommendResult, ShareRecord } from './types';

// 内存存储（Vercel serverless 下每次调用可能重置，仅演示用）
const store = new Map<string, ShareRecord>();

export function saveRecommendation(result: RecommendResult): string {
  const code = nanoid(8); // 8位短码
  const record: ShareRecord = {
    code,
    result,
    createdAt: new Date().toISOString(),
  };
  store.set(code, record);
  return code;
}

export function getRecommendation(code: string): ShareRecord | null {
  return store.get(code) || null;
}

// 顾问邮箱配置（从环境变量读取）
export const ADVISOR_EMAIL = process.env.ADVISOR_EMAIL || '';
