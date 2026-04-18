// 宁波中考志愿推荐系统类型定义

export type SchoolCategory =
  | '省重点'
  | '市重点'
  | '普通'
  | '国家示范'
  | '国家重点'
  | '省重点职校'
  | '特色'
  | '普职融通'
  | '民办';

export type District =
  | '海曙区'
  | '江北区'
  | '鄞州区'
  | '镇海区'
  | '北仑区'
  | '市直属';

export type SchoolType = '普通高中' | '中等职业学校';
export type TierType = '冲' | '稳' | '保';
export type AdviceGroup = '普通高中' | '中等职业学校';

export interface School {
  id: string;
  name: string;
  type: SchoolType;
  category: SchoolCategory;
  rankThreshold: number;
  scoreThreshold: number;
  district?: District;
  notes?: string;
}

export interface CandidateProfile {
  userScore: number;
  userRank: number;
  userName: string;
  userEmail?: string;
  estimatedRank: boolean;
}

export interface RecommendedSchool {
  school: School;
  probability: number;
  tier: TierType;
  reason: string;
  matchDelta: number;
  adviceOrder?: number;
  adviceGroup?: AdviceGroup;
}

export interface AdviceItem {
  order: number;
  group: AdviceGroup;
  school: School;
  tier: TierType;
  probability: number;
  reason: string;
}

export interface RecommendResult extends CandidateProfile {
  generatedAt: string;
  highSchools: RecommendedSchool[];
  vocationalSchools: RecommendedSchool[];
  adviceList: AdviceItem[];
}

export interface ShareRecord {
  code: string;
  result: RecommendResult;
  createdAt: string;
}
