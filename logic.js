import { highSchoolPool, vocationalSchoolPool, strategyConfig } from './data.js';

function getRiskLabel(delta) {
  if (delta <= 350) return '可冲';
  if (delta <= 1400) return '较稳';
  return '保底';
}

function getAdmissionHint(delta) {
  if (delta <= 0) return '你的位次优于该校去年录取位次，可作为偏稳志愿。';
  if (delta <= 350) return '与你的位次接近，可作为冲刺志愿。';
  if (delta <= 1400) return '与你的位次存在安全垫，可作为稳妥志愿。';
  return '与去年录取位次差距较大，适合作为保底志愿。';
}

function buildRecommendationSchool(school, userRank, targetTier) {
  const delta = school.rank2025 - userRank;
  return {
    ...school,
    targetTier,
    delta,
    riskLabel: getRiskLabel(delta),
    admissionHint: getAdmissionHint(delta)
  };
}

function selectTierSchools(userRank, tierName, pool, usedIds) {
  const range = strategyConfig.highSchoolRanges[tierName];
  return pool
    .filter((school) => !usedIds.has(school.id))
    .map((school) => ({ school, delta: school.rank2025 - userRank }))
    .filter(({ delta }) => delta >= range.min && delta <= range.max)
    .sort((a, b) => Math.abs(a.delta) - Math.abs(b.delta))
    .slice(0, strategyConfig.highSchoolSlots[tierName])
    .map(({ school }) => school);
}

function fillRemainingHighSchools(selected, usedIds, userRank) {
  const remain = 8 - selected.length;
  if (remain <= 0) return [];

  return highSchoolPool
    .filter((school) => !usedIds.has(school.id))
    .map((school) => ({ school, distance: Math.abs(school.rank2025 - userRank) }))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, remain)
    .map(({ school }) => school);
}

function buildHighSchoolPlan(userRank) {
  const usedIds = new Set();
  const rush = selectTierSchools(userRank, 'rush', highSchoolPool, usedIds);
  rush.forEach((school) => usedIds.add(school.id));

  const stable = selectTierSchools(userRank, 'stable', highSchoolPool, usedIds);
  stable.forEach((school) => usedIds.add(school.id));

  const safe = selectTierSchools(userRank, 'safe', highSchoolPool, usedIds);
  safe.forEach((school) => usedIds.add(school.id));

  const filled = fillRemainingHighSchools([...rush, ...stable, ...safe], usedIds, userRank);

  const ordered = [
    ...rush.map((school) => buildRecommendationSchool(school, userRank, '冲')),
    ...stable.map((school) => buildRecommendationSchool(school, userRank, '稳')),
    ...safe.map((school) => buildRecommendationSchool(school, userRank, '保')),
    ...filled.map((school) => buildRecommendationSchool(school, userRank, '补位'))
  ].slice(0, 8);

  return ordered.map((school, index) => ({
    ...school,
    volunteerOrder: index + 1
  }));
}

function buildVocationalPlan() {
  return vocationalSchoolPool.map((school, index) => ({
    ...school,
    volunteerOrder: index + 1,
    targetTier: '中职备选',
    riskLabel: '待补充',
    admissionHint: '待补充真实中职学校与专业数据后，再生成精确推荐。'
  }));
}

export function getRecommendations({ score, rank, name }) {
  if (!rank || rank <= 0) {
    throw new Error('请输入有效位次。');
  }

  const highSchools = buildHighSchoolPlan(rank);
  const vocationalSchools = buildVocationalPlan();

  return {
    meta: {
      name,
      score,
      rank,
      generatedAt: new Date().toISOString(),
      summary: '系统按中心城区近年录取位次，生成 8 个普高志愿和 10 个中职备选位。'
    },
    highSchools,
    vocationalSchools,
    strategyAdvice: [
      '前2个普高志愿用于冲刺，不建议全部填同一梯度学校。',
      '中间3个普高志愿作为核心稳妥位，是最终录取的关键区。',
      '最后3个普高志愿承担保底功能，应确保有真实承接力。',
      '中职部分当前仅保留志愿位，待补充城区真实学校与专业库后再启用。'
    ]
  };
}
