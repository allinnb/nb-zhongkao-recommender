'use client';

import { BlobProvider, Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';
import type { RecommendResult } from '@/lib/types';

let fontRegistered = false;

function ensureFontRegistered() {
  if (fontRegistered) return;

  try {
    Font.register({
      family: 'HelveticaFallback',
      fonts: [
        { src: 'Helvetica', fontWeight: 400 },
        { src: 'Helvetica-Bold', fontWeight: 700 },
      ],
    });
  } catch {
    // ignore runtime registration failures and let renderer fallback
  }

  fontRegistered = true;
}

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 28,
    paddingHorizontal: 26,
    fontSize: 10,
    color: '#1f2937',
    fontFamily: 'HelveticaFallback',
  },
  title: {
    fontSize: 18,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 12,
  },
  summaryBox: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  summaryLine: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 8,
    color: '#0f172a',
  },
  item: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    padding: 8,
    marginBottom: 6,
  },
  itemTitle: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 3,
  },
  itemMeta: {
    fontSize: 8,
    color: '#64748b',
    marginBottom: 2,
  },
  itemText: {
    fontSize: 8,
    color: '#475569',
    lineHeight: 1.4,
  },
  note: {
    fontSize: 8,
    color: '#64748b',
    lineHeight: 1.5,
    marginTop: 8,
  },
  footer: {
    marginTop: 12,
    fontSize: 7,
    color: '#94a3b8',
  },
});

function ReportPDF({ result }: { result: RecommendResult }) {
  ensureFontRegistered();

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>宁波城区中考志愿推荐报告</Text>
        <Text style={styles.subtitle}>基于分数、位次与冲稳保策略生成</Text>

        <View style={styles.summaryBox}>
          <Text style={styles.summaryLine}>考生姓名：{result.userName}</Text>
          <Text style={styles.summaryLine}>中考分数：{result.userScore} 分</Text>
          <Text style={styles.summaryLine}>宁波市位次：第 {result.userRank} 位</Text>
          <Text style={styles.summaryLine}>位次来源：{result.estimatedRank ? '系统估算' : '用户填写'}</Text>
          {result.userEmail ? <Text style={styles.summaryLine}>联系邮箱：{result.userEmail}</Text> : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>一、普通高中推荐（8 所）</Text>
          {result.highSchools.map((item, index) => (
            <View key={item.school.id} style={styles.item}>
              <Text style={styles.itemTitle}>{index + 1}. {item.school.name}</Text>
              <Text style={styles.itemMeta}>{item.tier} · {item.probability}% · {item.school.category}{item.school.district ? ` · ${item.school.district}` : ''}</Text>
              <Text style={styles.itemText}>{item.reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>二、中等职业学校推荐（10 所）</Text>
          {result.vocationalSchools.map((item, index) => (
            <View key={item.school.id} style={styles.item}>
              <Text style={styles.itemTitle}>{index + 1}. {item.school.name}</Text>
              <Text style={styles.itemMeta}>{item.tier} · {item.probability}% · {item.school.category}{item.school.district ? ` · ${item.school.district}` : ''}</Text>
              <Text style={styles.itemText}>{item.reason}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>三、志愿顺序建议（第 1-18 志愿）</Text>
          {result.adviceList.map((item) => (
            <View key={`${item.group}-${item.order}-${item.school.id}`} style={styles.item}>
              <Text style={styles.itemTitle}>第 {item.order} 志愿：{item.school.name}</Text>
              <Text style={styles.itemMeta}>{item.group} · {item.tier} · {item.probability}%</Text>
              <Text style={styles.itemText}>{item.reason}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.note}>
          说明：本报告基于历史公开录取数据与位次匹配逻辑生成，仅供家长和学生作为填报辅助参考。正式志愿填报请以宁波市当年官方招生计划、分数线和学校招生政策为准。
        </Text>
        <Text style={styles.footer}>生成时间：{new Date(result.generatedAt).toLocaleString('zh-CN')}</Text>
      </Page>
    </Document>
  );
}

export default function PDFDownloadButton({ result }: { result: RecommendResult }) {
  const fileName = `宁波中考志愿推荐_${result.userName}_${new Date(result.generatedAt).toISOString().slice(0, 10)}.pdf`;

  return (
    <BlobProvider document={<ReportPDF result={result} />}>
      {({ url, loading, error }) => {
        if (loading) {
          return <span className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white">正在生成 PDF...</span>;
        }

        if (error || !url) {
          return <span className="flex flex-1 items-center justify-center rounded-full bg-slate-300 px-6 py-3 font-medium text-slate-700">PDF 生成失败</span>;
        }

        return (
          <a
            href={url}
            download={fileName}
            className="flex flex-1 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-purple-600 px-6 py-3 font-medium text-white transition hover:shadow-lg"
          >
            导出 PDF 报告
          </a>
        );
      }}
    </BlobProvider>
  );
}
