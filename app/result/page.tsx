'use client';

import Link from 'next/link';
import { Suspense, useMemo, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import { AlertTriangle, ArrowLeft, CheckCircle2, Copy, Home, School, TrendingUp, UserRound, XCircle } from 'lucide-react';
import PDFDownloadButton from '@/components/pdf-report';
import { generateRecommendation, getProbabilityInfo } from '@/lib/algorithm';
import type { RecommendResult, RecommendedSchool } from '@/lib/types';

function ResultContent() {
  const searchParams = useSearchParams();
  const result = useMemo<RecommendResult | null>(() => {
    const name = searchParams.get('name')?.trim() ?? '';
    const scoreParam = searchParams.get('score');
    const rankParam = searchParams.get('rank');
    const email = searchParams.get('email')?.trim() || undefined;

    const score = scoreParam ? Number(scoreParam) : NaN;
    const rank = rankParam ? Number(rankParam) : undefined;

    if (!name || !Number.isInteger(score) || score < 0 || score > 660) {
      return null;
    }

    if (rankParam && (!Number.isInteger(rank) || rank! < 1 || rank! > 60000)) {
      return null;
    }

    return generateRecommendation({
      userName: name,
      userScore: score,
      userRank: rank,
      userEmail: email,
    });
  }, [searchParams]);

  const handleCopyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
  };

  if (!result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 px-4">
        <div className="max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="mb-2 text-xl font-semibold text-slate-900">未识别到有效结果参数</h1>
          <p className="mb-6 text-slate-500">请返回首页重新填写分数和位次后生成推荐方案。</p>
          <Link href="/" className="inline-flex items-center gap-2 rounded-full bg-blue-500 px-6 py-3 font-medium text-white transition hover:bg-blue-600">
            <Home className="h-4 w-4" />
            返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
              <School className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold text-slate-900">宁波城区中考志愿报告</h1>
              <p className="text-xs text-slate-500">{result.userName} · {result.userScore} 分</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleCopyLink}
              className="rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
            >
              复制链接
            </button>
            <Link href="/" className="rounded-full px-3 py-2 text-sm text-slate-600 transition hover:bg-slate-100 hover:text-slate-900">
              首页
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <section className="mb-6 grid gap-4 md:grid-cols-4">
          <SummaryCard icon={<TrendingUp className="h-5 w-5 text-blue-500" />} label="中考分数" value={`${result.userScore} 分`} />
          <SummaryCard icon={<UserRound className="h-5 w-5 text-purple-500" />} label="宁波市位次" value={`第 ${result.userRank} 位`} />
          <SummaryCard icon={<School className="h-5 w-5 text-emerald-500" />} label="普高/中职推荐" value="8 所 + 10 所" />
          <SummaryCard
            icon={<AlertTriangle className="h-5 w-5 text-amber-500" />}
            label="位次来源"
            value={result.estimatedRank ? '系统估算' : '用户填写'}
          />
        </section>

        <section className="mb-6 rounded-2xl bg-blue-50 p-4 text-sm text-blue-700">
          <p className="font-medium">填报思路</p>
          <p className="mt-1">
            本系统采用“冲、稳、保”三段式推荐：前段给冲刺校，中段放最匹配学校，后段安排更稳妥学校，并进一步生成完整志愿顺序建议。
          </p>
        </section>

        <SchoolSection title="普通高中推荐" subtitle="共 8 所" schools={result.highSchools} color="blue" />
        <SchoolSection title="中等职业学校推荐" subtitle="共 10 所" schools={result.vocationalSchools} color="green" />

        <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-slate-900">志愿顺序建议</h2>
          </div>
          <div className="space-y-3">
            {result.adviceList.map((item) => {
              const prob = getProbabilityInfo(item.probability);
              return (
                <div key={`${item.group}-${item.order}-${item.school.id}`} className="flex flex-col gap-2 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-start gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
                      {item.order}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-slate-900">{item.school.name}</p>
                        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.group}</span>
                        <span className={`rounded px-2 py-0.5 text-xs font-bold ${tierBadgeClass(item.tier)}`}>{item.tier}</span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 md:text-right">
                    <div className={`font-semibold ${prob.color}`}>{item.probability}% · {prob.label}</div>
                    <div className="text-xs text-slate-400">{item.school.category}{item.school.district ? ` · ${item.school.district}` : ''}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <div className="flex flex-col gap-4 sm:flex-row">
          <Link href="/" className="flex flex-1 items-center justify-center gap-2 rounded-full border border-slate-200 px-6 py-3 text-slate-700 transition hover:bg-slate-50">
            <ArrowLeft className="h-4 w-4" />
            返回重新填写
          </Link>
          <PDFDownloadButton result={result} />
        </div>

        <section className="mt-8 rounded-2xl bg-slate-100 p-4 text-sm text-slate-500">
          <p className="mb-2 font-medium text-slate-700">使用提醒</p>
          <p>
            本推荐仅基于历史公开数据与冲稳保策略建模，用于辅助判断，不替代当年官方招生计划、最新分数线与学校招生政策。若位次为系统估算，请务必在正式填报前用真实位次再次核验。
          </p>
        </section>
      </main>
    </div>
  );
}

function SummaryCard({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center gap-2">{icon}<span className="text-sm text-slate-500">{label}</span></div>
      <div className="text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function tierBadgeClass(tier: string) {
  if (tier === '冲') return 'bg-orange-100 text-orange-700';
  if (tier === '稳') return 'bg-blue-100 text-blue-700';
  return 'bg-green-100 text-green-700';
}

function groupByTier(schools: RecommendedSchool[]) {
  return {
    冲: schools.filter((item) => item.tier === '冲'),
    稳: schools.filter((item) => item.tier === '稳'),
    保: schools.filter((item) => item.tier === '保'),
  };
}

function SchoolSection({
  title,
  subtitle,
  schools,
  color,
}: {
  title: string;
  subtitle: string;
  schools: RecommendedSchool[];
  color: 'blue' | 'green';
}) {
  const groups = groupByTier(schools);
  const titleColor = color === 'blue' ? 'text-blue-600' : 'text-green-600';

  return (
    <section className="mb-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-2">
        <School className={`h-5 w-5 ${titleColor}`} />
        <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
        <span className="text-sm text-slate-400">{subtitle}</span>
      </div>

      <div className="space-y-4">
        {(['冲', '稳', '保'] as const).map((tier) => {
          const tierSchools = groups[tier];
          if (!tierSchools.length) return null;

          return (
            <div key={tier}>
              <div className="mb-2 flex items-center gap-2">
                <span className={`rounded px-2 py-0.5 text-xs font-bold ${tierBadgeClass(tier)}`}>{tier}</span>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="space-y-2">
                {tierSchools.map((item) => {
                  const prob = getProbabilityInfo(item.probability);
                  return (
                    <div key={item.school.id} className="flex flex-col gap-3 rounded-2xl border border-slate-100 p-4 md:flex-row md:items-center md:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-slate-900">{item.school.name}</p>
                          <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.school.category}</span>
                          {item.school.district ? <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{item.school.district}</span> : null}
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{item.reason}</p>
                      </div>
                      <div className="text-sm md:text-right">
                        <div className={`font-semibold ${prob.color}`}>{item.probability}% · {prob.label}</div>
                        <div className="text-xs text-slate-400">位次差 {item.matchDelta > 0 ? '+' : ''}{item.matchDelta}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-slate-50 to-blue-50 text-slate-500">正在加载结果...</div>}>
      <ResultContent />
    </Suspense>
  );
}
