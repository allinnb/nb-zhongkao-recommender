export const highSchoolPool = [
  {
    id: 'xs-east',
    name: '宁波市效实中学（东部校区）',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 639,
    rank2024: 209,
    score2025: 642,
    rank2025: 154,
    tags: ['名校', '理科强', '高位冲刺'],
    note: '顶尖公办普高，适合高位次考生冲刺。'
  },
  {
    id: 'yz-middle',
    name: '宁波市鄞州中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 635,
    rank2024: 483,
    score2025: 638,
    rank2025: 344,
    tags: ['名校', '学术强', '高位冲刺'],
    note: '传统强校，适合追求优质本科出口的学生。'
  },
  {
    id: 'ningbo-high',
    name: '宁波中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 634,
    rank2024: 648,
    score2025: 636,
    rank2025: 605,
    tags: ['重点高中', '均衡', '稳妥'],
    note: '传统重点普高，适合稳中求进。'
  },
  {
    id: 'haishu-high',
    name: '宁波市海曙中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 633,
    rank2024: 741,
    score2025: 635,
    rank2025: 657,
    tags: ['公办', '城区', '稳妥'],
    note: '中心城区优质公办，适合作为稳妥位。'
  },
  {
    id: 'xs-baiyang',
    name: '宁波市效实中学（白杨校区）',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 630,
    rank2024: 1119,
    score2025: 631,
    rank2025: 1045,
    tags: ['名校体系', '城区', '稳妥'],
    note: '效实体系校区，适合中高位次考生。'
  },
  {
    id: 'huizhen',
    name: '宁波市惠贞书院',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 627,
    rank2024: 1491,
    score2025: 629,
    rank2025: 1406,
    tags: ['书院制', '公办', '稳妥'],
    note: '录取位置相对稳定，适合中位次稳妥填报。'
  },
  {
    id: 'yz-senior',
    name: '宁波市鄞州高级中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 627,
    rank2024: 1639,
    score2025: 628,
    rank2025: 1481,
    tags: ['区属优高', '稳妥', '保稳过渡'],
    note: '区属优质普高，适合作为稳妥至保底过渡位。'
  },
  {
    id: 'foreign-lang',
    name: '宁波外国语学校（浙江省八一学校）',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 625,
    rank2024: 1930,
    score2025: 626,
    rank2025: 1810,
    tags: ['外语特色', '国际视野', '稳妥'],
    note: '适合语言优势或国际方向偏好的学生。'
  },
  {
    id: 'second-high',
    name: '宁波市第二中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 624,
    rank2024: 2179,
    score2025: 625,
    rank2025: 2040,
    tags: ['老牌公办', '管理稳', '保稳'],
    note: '老牌公办高中，适合作为稳妥保底位。'
  },
  {
    id: 'jiangshan',
    name: '宁波市姜山中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: 621,
    rank2024: 2736,
    score2025: 623,
    rank2025: 2449,
    tags: ['区属高中', '保底', '稳定'],
    note: '适合中段考生作为保底位。'
  },
  {
    id: 'foreign-senior',
    name: '宁波外国语高级中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: null,
    rank2024: null,
    score2025: 622,
    rank2025: 2612,
    tags: ['新校', '外语特色', '观察位'],
    note: '新纳入数据，适合作为中后位次观察填报位。'
  },
  {
    id: 'nottingham-public',
    name: '宁波诺丁汉大学附属中学（公办班）',
    district: '中心城区',
    category: '民办普高',
    batch: '普通班（公办班）',
    score2024: 620,
    rank2024: 2917,
    score2025: 619,
    rank2025: 2991,
    tags: ['公办班', '过渡位', '保底'],
    note: '适合作为公办普高末位与保底衔接位。'
  },
  {
    id: 'kechuang',
    name: '宁波科创中学',
    district: '中心城区',
    category: '公办普高',
    batch: '普通班',
    score2024: null,
    rank2024: null,
    score2025: 618,
    rank2025: 3308,
    tags: ['新校', '科创', '保底'],
    note: '适合保底与新校接受度较高的考生。'
  }
];

export const vocationalSchoolPool = Array.from({ length: 10 }, (_, index) => ({
  id: `voc-placeholder-${index + 1}`,
  name: `中职志愿待补充 ${index + 1}`,
  district: '中心城区',
  category: '中等职业学校',
  major: '待补充',
  score2025: null,
  rank2025: null,
  tags: ['待补充'],
  note: '当前附件未提供完整中职学校数据库，此处仅保留志愿位。'
}));

export const strategyConfig = {
  highSchoolSlots: { rush: 2, stable: 3, safe: 3 },
  highSchoolRanges: {
    rush: { min: -250, max: 350 },
    stable: { min: 351, max: 1400 },
    safe: { min: 1401, max: 4200 }
  }
};
