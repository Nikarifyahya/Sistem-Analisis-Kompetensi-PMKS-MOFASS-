export type MofassCategoryId = 'M' | 'O' | 'F' | 'A' | 'S_SALES' | 'S_SYSTEM';

export interface UserProfile {
  uid: string;
  fullName: string;
  email: string;
  phone?: string;
  role?: string;
  photoURL?: string;
  isDemo?: boolean;
}

export type BusinessSector = 
  | 'Pembuatan / Pengilangan'
  | 'Perkhidmatan (Services)'
  | 'Peruncitan & Pemborongan'
  | 'Makanan & Minuman (F&B)'
  | 'Teknologi & Digital'
  | 'Profesional & Konsultansi'
  | 'Pertanian & Asas Tani'
  | 'Pembinaan & Kejuruteraan'
  | 'Lain-lain';

export type BusinessSize = 'Mikro (< RM300k / < 5 Pekerja)' | 'Kecil (RM300k - RM15m / 5 - 75 Pekerja)' | 'Sederhana (RM15m - RM50m / 75 - 200 Pekerja)';

export interface CompanyProfile {
  companyName: string;
  ssmNumber: string;
  sector: BusinessSector;
  businessSize: BusinessSize;
  yearsInOperation: number;
  annualTurnover: string;
  employeeCount: number;
  state: string;
  district?: string;
  website?: string;
  briefDescription?: string;
}

export interface MofassQuestion {
  id: string; // e.g., 'M1', 'M2', 'O1'
  categoryId: MofassCategoryId;
  number: number;
  text: string;
  guidance?: string;
}

export interface MofassCategory {
  id: MofassCategoryId;
  code: string;
  letter: string;
  name: string;
  shortName: string;
  description: string;
  badgeColor: string;
  iconName: string;
  questions: MofassQuestion[];
}

export type CompetencyLevelGrade = 'Tahap 1' | 'Tahap 2' | 'Tahap 3' | 'Tahap 4';

export interface CategoryScoreResult {
  categoryId: MofassCategoryId;
  categoryName: string;
  score: number; // e.g. 38
  maxScore: number; // 50
  percentage: number; // e.g. 76%
  levelGrade: CompetencyLevelGrade;
  levelLabel: string;
  status: 'Kritikal' | 'Perlu Pembaikan' | 'Memuaskan' | 'Cemerlang';
  keyGaps: string[];
  keyStrengths: string[];
}

export interface StrategicKPI {
  metric: string;
  baseline: string;
  target12Months: string;
  category: MofassCategoryId | 'ALL';
  measurementFrequency: string;
}

export interface DetailedActionPlan {
  id: string;
  initiative: string;
  category: string;
  phase: 'Fasa 1 (30 Hari - Quick Wins)' | 'Fasa 2 (60 Hari - Penstrukturan)' | 'Fasa 3 (90 Hari - Penskalaan)' | 'Fasa 4 (180 Hari - Transformasi)';
  specificActions: string[];
  pic: string; // Person In Charge
  resourcesNeeded: string;
  kpiTarget: string;
  riskLevel: 'Rendah' | 'Sederhana' | 'Tinggi';
}

export interface IndustryLandscapeData {
  sectorOverview: string;
  marketTrends: string[];
  keyChallenges: string[];
  governmentPolicySupport: string[];
  growthDrivers: string[];
  stageAnalysis?: string;
  yearsInOperation?: number;
  source?: 'gemini-ai' | 'ml-rules';
  generatedAt?: string;
}

export interface ElementDeepAnalysis {
  categoryId: MofassCategoryId;
  narrativeDiagnosis: string;
  rootCauses: string[];
  strategicPrescription: string;
}

export interface StrategicBlueprint {
  transformationVision: string;
  corePillars: {
    title: string;
    focus: string;
    expectedOutcome: string;
  }[];
  kpis: StrategicKPI[];
  actionPlan: DetailedActionPlan[];
  estimatedBudgetROI: {
    estimatedInvestment: string;
    projectedPaybackPeriod: string;
    projectedGrowthRate: string;
  };
}

export interface ActionPlanItem {
  id: string;
  title: string;
  category: string;
  timeframe: '30 Hari (Cepat)' | '60 Hari (Sederhana)' | '90 Hari (Strategik)';
  priority: 'Kritikal' | 'Tinggi' | 'Sederhana';
  impactArea: string;
  actionDetails: string[];
  suggestedToolsOrAgencies?: string[];
  completed?: boolean;
}

export interface GovernmentProgram {
  agency: string;
  programName: string;
  eligibility: string;
  supportType: 'Geran Sepadan' | 'Pinjaman Mudah' | 'Bimbingan & Latihan' | 'Pensijilan & Pasaran';
  description: string;
  targetCategory: MofassCategoryId[];
}

export interface AssessmentResult {
  id: string;
  userId: string;
  userEmail: string;
  companyProfile: CompanyProfile;
  userProfile: UserProfile;
  answers: Record<string, number>; // questionId -> 1..5
  categoryScores: Record<MofassCategoryId, CategoryScoreResult>;
  totalScore: number; // out of 300
  overallPercentage: number;
  maturityLevel: CompetencyLevelGrade;
  maturityTitle: string;
  maturityDescription: string;
  industryLandscape: IndustryLandscapeData;
  elementDeepAnalyses: Record<MofassCategoryId, ElementDeepAnalysis>;
  strategicBlueprint: StrategicBlueprint;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  growthRoadmap: ActionPlanItem[];
  matchedGovPrograms: GovernmentProgram[];
  aiExecutiveSummary: string;
  createdAt: string;
  updatedAt?: string;
}
