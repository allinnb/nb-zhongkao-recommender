'use client';

import { useEffect, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronRight, Download, GraduationCap, Mail, School, Shield, Zap } from 'lucide-react';

interface FormData {
  userName: string;
  score: string;
  rank: string;
  email: string;
}

const STORAGE_KEY = 'nbZhongkaoForm';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [form, setForm] = useState<FormData>({ userName: '', score: '', rank: '', email: '' });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    try {
      setForm(JSON.parse(saved));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const updateField = (field: keyof FormData, value: string) => {
    const next = { ...form, [field]: value };
    setForm(next);

    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!form.userName.trim()) {
      newErrors.userName = '请输入考生姓名';
    } else if (form.userName.trim().length > 20) {
      newErrors.userName = '姓名不超过20字';
    }

    const score = Number(form.score);
    if (!form.score) {
      newErrors.score = '请输入中考分数';
    } else if (!Number.isInteger(score) || score < 0 || score > 660) {
      newErrors.score = '分数范围为 0-660 分';
    }

    if (form.rank) {
      const rank = Number(form.rank);
      if (!Number.isInteger(rank) || rank < 1 || rank > 60000) {
        newErrors.rank = '位次范围为 1-60000';
      }
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = '请输入有效邮箱';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const params = new URLSearchParams({
      name: form.userName.trim(),
      score: String(Number(form.score)),
    });

    if (form.rank) params.set('rank', String(Number(form.rank)));
    if (form.email.trim()) params.set('email', form.email.trim());

    router.push(`/result?${params.toString()}`);
  };

  const inputClass = (field: keyof FormData) =>
    `w-full rounded-xl border px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-400' : 'border-slate-200'
    }`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900">宁波城区中考志愿推荐</h1>
              <p className="text-xs text-slate-500">输入分数与位次，快速生成冲稳保方案</p>
            </div>
          </div>
          <div className="hidden text-sm text-slate-500 md:block">家长学生可直接使用</div>
        </div>
      </header>

      <main className="px-4 py-10">
        <section className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-4xl font-bold text-slate-900 md:text-5xl">
            用 <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">冲稳保</span>
            思路排好今年志愿
          </h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-slate-600">
            根据分数和位次，输出 8 所普通高中、10 所中等职业学校，并直接给出第 1 到第 18 志愿的填报顺序建议。
          </p>

          <div className="mb-12 flex flex-wrap justify-center gap-4">
            <FeaturePill icon={<Shield className="h-4 w-4 text-blue-500" />} text="静态部署更稳定" />
            <FeaturePill icon={<Zap className="h-4 w-4 text-amber-500" />} text="输入后即时出结果" />
            <FeaturePill icon={<Download className="h-4 w-4 text-green-500" />} text="支持 PDF 导出" />
            <FeaturePill icon={<Mail className="h-4 w-4 text-purple-500" />} text="邮件功能后续接入" />
          </div>
        </section>

        <section className="mx-auto max-w-xl">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-lg shadow-slate-200/60">
            <h3 className="mb-6 flex items-center gap-2 text-xl font-semibold text-slate-900">
              <School className="h-5 w-5 text-blue-500" />
              填写考生信息
            </h3>

            <form onSubmit={onSubmit} className="space-y-5">
              <Field label="考生姓名" required error={errors.userName}>
                <input
                  type="text"
                  placeholder="请输入考生姓名"
                  value={form.userName}
                  onChange={(e) => updateField('userName', e.target.value)}
                  className={inputClass('userName')}
                />
              </Field>

              <Field label="中考分数" required error={errors.score} hint="2025 年宁波中考满分 660 分">
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="660"
                    placeholder="请输入分数"
                    value={form.score}
                    onChange={(e) => updateField('score', e.target.value)}
                    className={inputClass('score')}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">分</span>
                </div>
              </Field>

              <Field label="位次号" optional="选填" error={errors.rank} hint="如暂时不知道，可留空由系统估算">
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max="60000"
                    placeholder="请输入宁波市位次号"
                    value={form.rank}
                    onChange={(e) => updateField('rank', e.target.value)}
                    className={inputClass('rank')}
                  />
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">位</span>
                </div>
              </Field>

              <Field label="邮箱" optional="选填" error={errors.email} hint="当前版本仅保存字段，后续再接入自动发信">
                <input
                  type="email"
                  placeholder="如需后续邮件接收，可先填写"
                  value={form.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  className={inputClass('email')}
                />
              </Field>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-4 font-semibold text-white shadow-lg shadow-blue-200 transition hover:scale-[1.01] disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
              >
                {isSubmitting ? '正在生成方案...' : '生成推荐方案'}
                {!isSubmitting && <ChevronRight className="h-5 w-5" />}
              </button>
            </form>
          </div>

          <div className="mt-6 rounded-2xl bg-white/80 p-5 text-left shadow-sm ring-1 ring-slate-200">
            <p className="mb-3 font-medium text-slate-800">系统输出内容</p>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>• 8 所普通高中推荐名单</li>
              <li>• 10 所中等职业学校推荐名单</li>
              <li>• 冲 / 稳 / 保 三层分类</li>
              <li>• 第 1 志愿到第 18 志愿排布建议</li>
              <li>• 可打印 PDF 报告</li>
            </ul>
            <div className="mt-4 text-xs text-slate-400">
              本工具为辅助决策系统，最终填报请以宁波市官方志愿规则与当年招生计划为准。
            </div>
          </div>

          <div className="mt-6 text-center text-sm text-slate-500">
            如误入空白页，可直接返回
            <Link href="/" className="ml-1 text-blue-600 hover:text-blue-700">
              首页重新填写
            </Link>
            。
          </div>
        </section>
      </main>
    </div>
  );
}

function FeaturePill({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-slate-100 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm">
      {icon}
      <span>{text}</span>
    </div>
  );
}

function Field({
  label,
  children,
  error,
  hint,
  required,
  optional,
}: {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
        {required && <span className="ml-1 text-red-500">*</span>}
        {optional && <span className="ml-1 font-normal text-slate-400">（{optional}）</span>}
      </label>
      {children}
      {error ? <p className="mt-1 text-sm text-red-500">{error}</p> : hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  );
}
