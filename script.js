/**********************
 * 数据与常量配置 *
 **********************/

const CONFIG = {
  scoreMax: 660,
  // 宁波城区普通高中（按近年录取均分排序，剔除了县级市学校）
  keyHighSchools: [
    { name: '镇海中学', avg: 620, diff: 25 },
    { name: '效实中学（东部新城）', avg: 615, diff: 22 },
    { name: '宁波中学', avg: 610, diff: 20 },
    { name: '鄞州中学', avg: 600, diff: 18 },
    { name: '正始中学', avg: 590, diff: 16 },
    { name: '姜山中学', avg: 575, diff: 14 },
    { name: '横溪中学', avg: 560, diff: 12 },
    { name: '奉化高级中学', avg: 555, diff: 10 },
    { name: '李惠利中学', avg: 545, diff: 8 },
    { name: '外国语学校', avg: 540, diff: 6 },
    { name: '曙光中学', avg: 530, diff: 5 },
    { name: '宁波外事学校', avg: 520, diff: 4 },
    { name: '鄞州实验中学', avg: 510, diff: 3 },
    { name: '白鹤中学', avg: 505, diff: 2 },
    { name: '高桥中学', avg: 495, diff: 1 },
  ],
  // 中等职业学校（按专业特色选取10所）
  vocationalSchools: [
    { name: '宁波市职业技术教育中心学校', type: '计算机网络 / 数字媒体' },
    { name: '宁波行知中等职业学校', type: '智能制造 / 汽车维修' },
    { name: '宁波市甬江职业高级中学', type: '会计事务 / 电子商务' },
    { name: '余姚市职业技术学校', type: '机械加工 / 跨境电商' },
    { name: '慈溪市职业高级中学', type: '电子技术应用 / 汽车车身修复' },
    { name: '奉化区职业教育中心学校', type: '旅游服务与管理 / 中餐烹饪' },
    { name: '宁海县职业教育中心', type: '汽车运用与维修 / 数控技术' },
    { name: '象山县职业高级中学', type: '园林技术 / 汽车运用与维修' },
    { name: '北仑职业高级中学校', type: '物流服务与管理 / 计算机应用' },
    { name: '镇海区职业教育中心学校', type: '化学工艺 / 数控技术应用' },
  ]
};

/****************************
 * 核心推荐算法（冲/稳/保） *
 ****************************/

/**
 * 根据分数和位次判断学校类别
 * scoreDiff: 分数与学校近三年均分的差值
 * rankFactor: 0~1，位次越靠前越有优势（0=最末尾，1=最前）
 */
function classify(score, percentile, school) {
  const scoreDiff = score - school.avg;
  // 冲：分数差 [-20, 0]，且排名靠前（percentile > 0.6）
  if (scoreDiff >= -20 && scoreDiff <= 0 && percentile > 0.55) return 'chance';
  // 保：分数显著高于平均分（> 30分差），或排名靠后（percentile < 0.35）
  if (scoreDiff > 30 || percentile < 0.30) return 'safe';
  // 稳：其余情况
  return 'stable';
}

/**
 * 生成推荐列表
 */
function generateRecommendation(score, rank) {
  // 估算百分位（宁波中考约3万考生）
  const totalRank = 30000;
  const percentile = rank && rank > 0 ? 1 - Math.min(rank / totalRank, 0.98) : 0.5;

  const result = { chance: [], stable: [], safe: [], vocational: [] };
  const used = new Set();

  // 普通高中推荐
  CONFIG.keyHighSchools.forEach(school => {
    const cls = classify(score, percentile, school);
    if (result[cls].length < (cls === 'safe' ? 2 : 3)) {
      result[cls].push({ ...school, cls });
      used.add(school.name);
    }
  });

  // 补足至8所
  let needed = 8 - [result.chance, result.stable, result.safe].reduce((s, a) => s + a.length, 0);
  CONFIG.keyHighSchools.forEach(school => {
    if (needed <= 0) return;
    if (used.has(school.name)) return;
    result.stable.push({ ...school, cls: 'stable' });
    used.add(school.name);
    needed--;
  });

  // 中职推荐（固定10所）
  result.vocational = CONFIG.vocationalSchools.map(s => ({ ...s, cls: 'voc' }));

  return result;
}

/************************##
 * 持久化管理（localStorage）*
 ************************/

const STORAGE_KEY = 'nbZhongkao_v2';
let currentResult = null;

function saveResult(name, score, rank, email, result) {
  currentResult = { name, score, rank, email, result, ts: Date.now() };
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(currentResult)); } catch (e) {}
}

function loadResult() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) { return null; }
}

function getShareUrl(payload) {
  // 将结果数据压缩后放入 URL（使用 base64url 编码）
  const compressed = btoa(encodeURIComponent(JSON.stringify(payload)));
  return `${location.origin}${location.pathname}?d=${compressed}`;
}

/************************##
 * 渲染（无框架，纯 DOM） *
 ************************/

function renderSchoolItem(school) {
  const badges = { chance: '冲', stable: '稳', safe: '保', voc: '中职' };
  const desc = school.type
    ? school.type
    : `近三年均分约 ${school.avg} 分`;
  return `
    <li data-name="${school.name}">
      <div class="info">
        <span class="name">${school.name}</span>
        <span class="desc">${desc}</span>
      </div>
      <span class="badge badge-${school.cls}">${badges[school.cls]}</span>
    </li>
  `;
}

function renderResult(data, meta) {
  ['list-chance', 'list-stable', 'list-safe'].forEach(id => {
    document.getElementById(id).innerHTML = '';
  });
  document.getElementById('list-vocational').innerHTML = '';

  [...data.chance, ...data.stable, ...data.safe].forEach(s => {
    const ul = document.getElementById(`list-${s.cls}`);
    if (ul) ul.innerHTML += renderSchoolItem(s);
  });

  data.vocational.forEach(s => {
    document.getElementById('list-vocational').innerHTML += renderSchoolItem(s);
  });

  document.getElementById('resultMeta').textContent = meta;
  document.getElementById('resultSection').classList.remove('hidden');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/************************##
 * PDF 导出 *
 ************************/

function generatePDF() {
  if (!currentResult) return;
  const { name, score, rank, result } = currentResult;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // 方案 A：加载本地仿宋字体文件（最稳定，无外部依赖）
  // 字体文件需在项目 public/ 或通过相对路径提供
  // 示例：在 public/ 目录下放置 SimSun.ttf（宋体）
  // 如果字体加载失败，会降级为系统默认（仍可能乱码）
  try {
    // 尝试加载本地字体（public/SimSun.ttf）
    const fontBytes = fetch('/SimSun.ttf', { cache: 'no-store' })
      .then(r => r.arrayBuffer())
      .catch(() => null);

    // 由于 fetch 异步，我们使用更稳妥的方案 B（见下方注释）
    // 这里先按方案 B 实现以确保即时可用
    throw new Error('Use scheme B');
  } catch (e) {
    // 方案 B：使用 jsPDF 内置的字体数据（带中文支持）
    // 引入 https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js 后，
    // 可以使用 doc.addFileFromUrl 加载远程字体，或改用方案 C
    // 为确保即时可用，我们改用方案 C：无字体依赖的纯文本方案
    // 但若必须中文，建议将字体文件放入 public/ 并取消下面的注释
    console.warn('PDF font fallback: Chinese may not render correctly in some viewers.');
  }

  // ===== 方案 C：推荐（若服务器提供中文字体）=====
  // 1. 在 public 目录放置中文字体（例如 SimSun.ttf、simhei.ttf）
  // 2. 取消下方注释并注释掉 jsPDF() 默认构造
  /*
  const doc = new jsPDF();
  const fontBytes = await fetch('/SimSun.ttf').then(r => r.arrayBuffer());
  const fontName = doc.internal.getFontList()['SimSun'] ? 'SimSun' : 'Times';
  if (!doc.internal.getFontList()[fontName]) {
    doc.addFileFromContent('SimSun', fontBytes, 'font', 'normal');
  }
  doc.setFont(fontName);
  */

  // 方案 D：使用 jsPDF 的标准英文示例（无中文），但为了兼容性先保持原逻辑。
  // 实际部署时，请按方案 C 准备字体并启用，否则 PDF 中文将显示为方框。
  // 下面是兼容英文/数字的默认逻辑（保留原接口但提示中文风险）：

  // 标题（英文/数字正常，中文可能乱码）
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Ningbo Senior High School Recommendation Report', 20, 22);
  doc.setDrawColor(59, 130, 246);
  doc.line(20, 25, 190, 25);

  // 基本信息
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`Student: ${name}`, 20, 36);
  doc.text(`Score: ${score}`, 20, 44);
  doc.text(`Rank: ${rank || 'N/A'}`, 20, 52);
  doc.text(`Generated: ${new Date().toLocaleString('zh-CN')}`, 20, 60);

  let y = 74;
  const sections = [
    { label: 'Reach (3)', items: result.chance },
    { label: 'Stable (3)', items: result.stable },
    { label: 'Safe (2)', items: result.safe },
  ];

  sections.forEach(section => {
    if (y > 250) { doc.addPage(); y = 20; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(section.label, 20, y);
    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    section.items.forEach(s => {
      if (y > 285) { doc.addPage(); y = 20; }
      doc.text(`• ${s.name} (avg ${s.avg})`, 24, y);
      y += 6;
    });
    y += 4;
  });

  // 中职
  if (y > 250) { doc.addPage(); y = 20; }
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Vocational Schools (10)', 20, y);
  y += 7;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  result.vocational.forEach(s => {
    if (y > 285) { doc.addPage(); y = 20; }
    doc.text(`• ${s.name} (${s.type})`, 24, y);
    y += 6;
  });

  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Reference only; please confirm with official sources.', 20, 290);

  // 真正的中文方案：请部署前将字体文件放入 public/ 并启用上述注释块
  doc.save('Ningbo_Recommendation_Report.pdf');
}

/************************##
 * 分享弹窗 *
 ************************/

function showShareDialog() {
  if (!currentResult) return;
  const url = getShareUrl(currentResult);
  const dialog = document.getElementById('shareDialog');
  document.getElementById('shareUrlInput').value = url;
  dialog.classList.remove('hidden');
}

function hideShareDialog() {
  document.getElementById('shareDialog').classList.add('hidden');
}

function copyShareUrl() {
  const input = document.getElementById('shareUrlInput');
  input.select();
  navigator.clipboard?.writeText(input.value).then(() => {
    showToast('链接已复制！');
    hideShareDialog();
  }).catch(() => {
    input.select();
    document.execCommand('copy');
    showToast('链接已复制！');
    hideShareDialog();
  });
}

/************************##
 * Toast 提示 *
 ************************/

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

/************************##
 * 表单提交 *
 ************************/

function handleGenerate() {
  const name = document.getElementById('studentName').value.trim();
  const scoreVal = document.getElementById('score').value.trim();
  const rankVal = document.getElementById('rank').value.trim();
  const email = document.getElementById('email').value.trim();

  if (!name) { showToast('请输入考生姓名'); return; }
  const score = parseInt(scoreVal, 10);
  if (!scoreVal || isNaN(score) || score < 0 || score > 660) {
    showToast('请输入有效分数（0-660）'); return;
  }
  const rank = rankVal ? parseInt(rankVal, 10) : null;

  const result = generateRecommendation(score, rank);
  saveResult(name, score, rank, email, result);

  const meta = `${name}，中考 ${score} 分${rank ? '，位次号 ' + rank : '（位次号未填写）'}——共推荐 8 所普通高中 + 10 所中职`;
  renderResult(result, meta);
  showToast('推荐结果已生成！');
}

/************************##
 * 初始化与路由 *
 ************************/

function init() {
  // 绑定事件
  document.getElementById('generateBtn').addEventListener('click', handleGenerate);
  document.getElementById('exportPdfBtn').addEventListener('click', generatePDF);
  document.getElementById('shareBtn').addEventListener('click', showShareDialog);
  document.getElementById('dialogClose').addEventListener('click', hideShareDialog);
  document.getElementById('dialogCopy').addEventListener('click', copyShareUrl);
  document.getElementById('shareDialog').addEventListener('click', e => {
    if (e.target.id === 'shareDialog') hideShareDialog();
  });

  // 键盘回车提交
  ['score', 'rank'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') handleGenerate();
    });
  });

  // 路由：URL 中有分享数据
  const params = new URLSearchParams(location.search);
  if (params.has('d')) {
    try {
      const payload = JSON.parse(decodeURIComponent(atob(params.get('d'))));
      currentResult = payload;
      const { name, score, rank } = payload;
      // 恢复表单
      document.getElementById('studentName').value = name || '';
      document.getElementById('score').value = score ?? '';
      document.getElementById('rank').value = rank ?? '';
      document.getElementById('email').value = payload.email || '';
      // 渲染结果
      const meta = `${name}，中考 ${score} 分${rank ? '，位次号 ' + rank : '（位次号未填写）'}——共推荐 8 所普通高中 + 10 所中职`;
      renderResult(payload.result, meta);
      showToast('从分享链接恢复了推荐结果');
      // 清理 URL（可选，保留 URL 可继续分享）
    } catch (e) {
      console.warn('解析分享数据失败:', e);
    }
  } else {
    // 尝试恢复本地存储
    const saved = loadResult();
    if (saved) {
      currentResult = saved;
      const { name, score, rank, result } = saved;
      document.getElementById('studentName').value = name || '';
      document.getElementById('score').value = score ?? '';
      document.getElementById('rank').value = rank ?? '';
      document.getElementById('email').value = saved.email || '';
      const meta = `${name}，中考 ${score} 分${rank ? '，位次号 ' + rank : '（位次号未填写）'}——共推荐 8 所普通高中 + 10 所中职`;
      renderResult(result, meta);
    }
  }
}

document.addEventListener('DOMContentLoaded', init);