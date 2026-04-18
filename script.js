import { getRecommendations } from './logic.js';

const STORAGE_KEY = 'nbZhongkaoResultV2';

const inputForm = document.getElementById('inputForm');
const userInfoEl = document.getElementById('userInfo');
const recommendationsEl = document.getElementById('recommendations');
const shareModal = document.getElementById('shareModal');
const shareUrlInput = document.getElementById('shareUrl');
const copyLinkBtn = document.getElementById('copyLink');
const closeShareBtn = document.querySelector('#shareModal .close');
const closeShareFooterBtn = document.getElementById('closeShare');
const downloadPdfBtn = document.getElementById('downloadPdf');

let currentResult = null;

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = String(text);
  return div.innerHTML;
}

function buildShareUrl() {
  const url = new URL(window.location.href);
  url.pathname = url.pathname.replace(/[^/]*$/, 'result.html');
  url.search = '';
  return url.toString();
}

function saveResult(payload) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

function loadResult() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function renderUserInfo(meta) {
  if (!userInfoEl) return;
  userInfoEl.innerHTML = `
    <span>考生：${escapeHtml(meta.name || '未命名')}</span>
    <span>分数：${escapeHtml(meta.score)}</span>
    <span>位次：${Number(meta.rank).toLocaleString()}</span>
    <span>说明：基于中心城区近年录取位次模拟</span>
  `;
}

function renderHighSchools(highSchools) {
  return `
    <section class="result-section">
      <h2>普通高中 8 志愿编排</h2>
      <div class="school-grid">
        ${highSchools.map((school) => `
          <article class="school-card tier-${school.targetTier}">
            <div class="volunteer-badge">第 ${school.volunteerOrder} 志愿</div>
            <h3>${escapeHtml(school.name)}</h3>
            <p><strong>类别：</strong>${escapeHtml(school.category)} / ${escapeHtml(school.batch)}</p>
            <p><strong>推荐层级：</strong>${escapeHtml(school.targetTier)}｜${escapeHtml(school.riskLabel)}</p>
            <p><strong>2025 位次：</strong>${school.rank2025.toLocaleString()}</p>
            <p><strong>2025 分数：</strong>${school.score2025 ?? '待补充'}</p>
            <p><strong>推荐理由：</strong>${escapeHtml(school.admissionHint)}</p>
            <p class="intro">${escapeHtml(school.note)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderVocationalSchools(vocationalSchools) {
  return `
    <section class="result-section">
      <h2>中职/综合高中 10 备选位</h2>
      <div class="school-grid">
        ${vocationalSchools.map((school) => `
          <article class="school-card placeholder-card">
            <div class="volunteer-badge">备选 ${school.volunteerOrder}</div>
            <h3>${escapeHtml(school.name)}</h3>
            <p><strong>类别：</strong>${escapeHtml(school.category)}</p>
            <p><strong>专业方向：</strong>${escapeHtml(school.major)}</p>
            <p><strong>状态：</strong>${escapeHtml(school.riskLabel)}</p>
            <p class="intro">${escapeHtml(school.admissionHint)}</p>
          </article>
        `).join('')}
      </div>
    </section>
  `;
}

function renderAdvice(adviceList, summary) {
  return `
    <section class="result-section advice-box">
      <h2>填报策略提示</h2>
      <p class="summary">${escapeHtml(summary)}</p>
      <ol>
        ${adviceList.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}
      </ol>
    </section>
  `;
}

function renderResult(result) {
  if (!recommendationsEl) return;
  recommendationsEl.innerHTML = [
    renderAdvice(result.strategyAdvice, result.meta.summary),
    renderHighSchools(result.highSchools),
    renderVocationalSchools(result.vocationalSchools)
  ].join('');
}

function handleFormSubmit(event) {
  event.preventDefault();

  const name = document.getElementById('name')?.value.trim();
  const score = Number(document.getElementById('score')?.value);
  const rank = Number(document.getElementById('rank')?.value);
  const email = document.getElementById('email')?.value.trim();

  if (!name || !score || !rank) {
    alert('请完整填写姓名、分数和位次。');
    return;
  }

  const result = getRecommendations({ name, score, rank, email });
  saveResult(result);
  window.location.href = 'result.html';
}

function initResultPage() {
  const result = loadResult();
  if (!result) {
    recommendationsEl.innerHTML = `
      <div class="error">
        <p>未找到可展示的结果，请先返回输入页生成方案。</p>
      </div>
    `;
    return;
  }

  currentResult = result;
  renderUserInfo(result.meta);
  renderResult(result);

  if (shareUrlInput) {
    shareUrlInput.value = buildShareUrl();
  }
}

function printAsPdf() {
  if (!currentResult) {
    alert('请先生成推荐结果。');
    return;
  }
  window.print();
}

if (inputForm) {
  inputForm.addEventListener('submit', handleFormSubmit);
}

if (recommendationsEl && userInfoEl) {
  initResultPage();
}

if (copyLinkBtn) {
  copyLinkBtn.addEventListener('click', async () => {
    const shareUrl = buildShareUrl();
    if (shareUrlInput) {
      shareUrlInput.value = shareUrl;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert('结果页链接已复制。此链接只分享页面地址，不包含你的本地结果数据。');
    } catch {
      if (shareUrlInput) {
        shareUrlInput.select();
        document.execCommand('copy');
      }
      alert('结果页链接已复制。');
    }
    if (shareModal) shareModal.style.display = 'block';
  });
}

if (closeShareBtn) {
  closeShareBtn.addEventListener('click', () => {
    if (shareModal) shareModal.style.display = 'none';
  });
}

if (closeShareFooterBtn) {
  closeShareFooterBtn.addEventListener('click', () => {
    if (shareModal) shareModal.style.display = 'none';
  });
}

window.addEventListener('click', (event) => {
  if (event.target === shareModal) {
    shareModal.style.display = 'none';
  }
});

if (downloadPdfBtn) {
  downloadPdfBtn.addEventListener('click', printAsPdf);
}
