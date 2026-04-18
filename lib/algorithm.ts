import type { AdviceGroup, AdviceItem, RecommendResult, RecommendedSchool, School, TierType } from './types';
import { highSchools, vocationalSchools } from './data/schools';

interface TierQuota {
  冲: number;
  稳: number;
  保: number;
}

const HIGH_SCHOOL_QUOTA: TierQuota = { 冲: 2, 稳: 3, 保: 3 };
const VOCATIONAL_QUOTA: TierQuota = { 冲: 2, 稳: 3, 保: 5 };

/**
 * 根据考生分数估算位次号
 * 宁波中考总分660分，采用分段线性近似
 */
export function estimateRankFromScore(score: number): number {
  if (score >= 640) return Math.max(1, Math.round(300 - (score - 640) * 10));
  if (score >= 600) return Math.round(300 + (640 - score) * 30);
  if (score >= 560) return Math.round(1500 + (600 - score) * 62.5);
  if (score >= 520) return Math.round(4000 + (560 - score) * 100);
  if (score >= 480) return Math.round(8000 + (520 - score) * 150);
  if (score >= 440) return Math.round(14000 + (480 - score) * 200);
  return Math.min(50000, Math.round(22000 + (440 - score) * 250));
}

function calculateProbability(userRank: number, schoolRank: number): number {
  if (schoolRank <= 0) return 50;

  const ratio = schoolRank / userRank;

  if (ratio <= 0.75) return 97;
  if (ratio <= 0.9) return 90;
  if (ratio <= 1.05) return 78;
  if (ratio <= 1.2) return 66;
  if (ratio <= 1.4) return 52;
  if (ratio <= 1.7) return 38;
  return 22;
}

function classifyTier(userRank: number, schoolRank: number): TierType {
  const ratio = schoolRank / userRank;

  if (ratio < 0.9) return '冲';
  if (ratio <= 1.2) return '稳';
  return '保';
}

function buildReason(userRank: number, school: School, tier: TierType, estimatedRank: boolean): string {
  const diff = school.rankThreshold - userRank;
  const absDiff = Math.abs(diff);
  const rankText = diff === 0
    ? '与您的位次基本持平'
    : diff < 0
      ? `往年门槛约高出您${absDiff}个位次，适合作为冲刺尝试`
      : `往年门槛约低于您${absDiff}个位次，整体更稳妥`;

  const tierText = tier === '冲'
    ? '建议作为冲志愿放在前段。'
    : tier === '稳'
      ? '建议作为中段主力志愿。'
      : '建议作为保底志愿放在后段。';

  const estimatedText = estimatedRank ? '当前位次为系统按分数估算，建议后续用正式位次复核。' : '';

  return `${rankText} ${tierText}${estimatedText}`.trim();
}

function compareForTier(a: RecommendedSchool, b: RecommendedSchool, tier: TierType) {
  if (tier === '冲') {
    return b.school.rankThreshold - a.school.rankThreshold;
  }

  if (tier === '稳') {
    return Math.abs(a.matchDelta) - Math.abs(b.matchDelta);
  }

  return a.school.rankThreshold - b.school.rankThreshold;
}

function buildSchoolPool(schools: School[], userRank: number, estimatedRank: boolean): RecommendedSchool[] {
  return schools
    .filter((school) => school.rankThreshold > 0)
    .map((school) => {
      const tier = classifyTier(userRank, school.rankThreshold);
      const probability = calculateProbability(userRank, school.rankThreshold);
      const matchDelta = school.rankThreshold - userRank;

      return {
        school,
        probability,
        tier,
        matchDelta,
        reason: buildReason(userRank, school, tier, estimatedRank),
      };
    });
}

function pickTieredRecommendations(
  schools: RecommendedSchool[],
  quota: TierQuota,
  limit: number,
  group: AdviceGroup
): RecommendedSchool[] {
  const pickedIds = new Set<string>();
  const picked: RecommendedSchool[] = [];

  const byTier = {
    冲: schools.filter((item) => item.tier === '冲').sort((a, b) => compareForTier(a, b, '冲')),
    稳: schools.filter((item) => item.tier === '稳').sort((a, b) => compareForTier(a, b, '稳')),
    保: schools.filter((item) => item.tier === '保').sort((a, b) => compareForTier(a, b, '保')),
  };

  (['冲', '稳', '保'] as TierType[]).forEach((tier) => {
    for (const item of byTier[tier]) {
      if (picked.length >= limit) break;
      if (pickedIds.has(item.school.id)) continue;
      if (picked.filter((entry) => entry.tier === tier).length >= quota[tier]) break;

      picked.push({ ...item, adviceGroup: group });
      pickedIds.add(item.school.id);
    }
  });

  if (picked.length < limit) {
    const remaining = schools
      .filter((item) => !pickedIds.has(item.school.id))
      .sort((a, b) => Math.abs(a.matchDelta) - Math.abs(b.matchDelta));

    for (const item of remaining) {
      if (picked.length >= limit) break;
      picked.push({ ...item, adviceGroup: group });
      pickedIds.add(item.school.id);
    }
  }

  const ordered = [
    ...picked.filter((item) => item.tier === '冲').sort((a, b) => compareForTier(a, b, '冲')),
    ...picked.filter((item) => item.tier === '稳').sort((a, b) => compareForTier(a, b, '稳')),
    ...picked.filter((item) => item.tier === '保').sort((a, b) => compareForTier(a, b, '保')),
  ].slice(0, limit);

  return ordered.map((item, index) => ({ ...item, adviceOrder: index + 1 }));
}

function buildAdviceList(highList: RecommendedSchool[], vocationalList: RecommendedSchool[]): AdviceItem[] {
  const advice: AdviceItem[] = [];

  highList.forEach((item, index) => {
    advice.push({
      order: index + 1,
      group: '普通高中',
      school: item.school,
      tier: item.tier,
      probability: item.probability,
      reason: item.reason,
    });
  });

  vocationalList.forEach((item, index) => {
    advice.push({
      order: highList.length + index + 1,
      group: '中等职业学校',
      school: item.school,
      tier: item.tier,
      probability: item.probability,
      reason: item.reason,
    });
  });

  return advice;
}

export function generateRecommendation(params: {
  userScore: number;
  userRank?: number;
  userName: string;
  userEmail?: string;
}): RecommendResult {
  const { userScore, userRank: providedRank, userName, userEmail } = params;
  const estimatedRank = !providedRank;
  const userRank = providedRank ?? estimateRankFromScore(userScore);

  const highPool = buildSchoolPool(highSchools, userRank, estimatedRank);
  const vocationalPool = buildSchoolPool(vocationalSchools, userRank, estimatedRank);

  const recommendedHigh = pickTieredRecommendations(highPool, HIGH_SCHOOL_QUOTA, 8, '普通高中');
  const recommendedVocational = pickTieredRecommendations(vocationalPool, VOCATIONAL_QUOTA, 10, '中等职业学校');
  const adviceList = buildAdviceList(recommendedHigh, recommendedVocational);

  return {
    userScore,
    userRank,
    userName,
    userEmail,
    estimatedRank,
    generatedAt: new Date().toISOString(),
    highSchools: recommendedHigh,
    vocationalSchools: recommendedVocational,
    adviceList,
  };
}

export function getProbabilityInfo(probability: number): {
  label: string;
  color: string;
  bgColor: string;
  emoji: string;
} {
  if (probability >= 85) {
    return {
      label: '把握较大',
      color: 'text-green-600',
      bgColor: 'bg-green-50 border-green-200',
      emoji: '🟢',
    };
  }
  if (probability >= 60) {
    return {
      label: '值得重点考虑',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50 border-amber-200',
      emoji: '🟡',
    };
  }
  return {
    label: '可作为冲刺',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 border-orange-200',
    emoji: '🟠',
    };
}
