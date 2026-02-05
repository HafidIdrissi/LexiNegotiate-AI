
export enum RiskLevel {
  HIGH = 'HIGH',
  MEDIUM = 'MEDIUM',
  LOW = 'LOW'
}

export enum NegotiationDifficulty {
  EASY = 'EASY',
  MEDIUM = 'MEDIUM',
  HARD = 'HARD'
}

export interface FinancialImpact {
  immediateRisk: number;
  annualExposure: number;
  lifetimeCost: number;
  comparisonSavings: number;
  riskReductionPercentage: number;
  currency: string;
}

export interface NegotiationTier {
  position: string;
  script: string;
  reasoning: string;
  sweetener?: string; // Only for Tier 2
}

export interface EmailTemplate {
  subject: string;
  body: string;
}

export interface EmailOptions {
  formal: EmailTemplate;
  professionalFriendly: EmailTemplate;
  collaborative: EmailTemplate;
}

export interface ChangeSummaryItem {
  type: 'deleted' | 'added' | 'clarified';
  originalText: string;
  recommendedText: string;
  impact: string;
  protectionGained: string;
  legalBasis: string;
}

export interface SuccessfulNegotiation {
  title: string;
  originalClause: string;
  counterProposal: string;
  result: string;
  landlordResponse: string;
  date: string;
}

export interface ClauseStatistics {
  successRate: number;
  avgResolutionDays: number;
  commonConcerns: string[];
  winningArguments: string[];
}

export interface NegotiationStrategy {
  tier1: NegotiationTier;
  tier2: NegotiationTier;
  tier3: {
    bottomLine: string;
    walkAwayAdvice: string;
  };
  difficulty: NegotiationDifficulty;
  contextTips: string;
  emailOptions: EmailOptions;
}

export interface Clause {
  id: string;
  category: string;
  originalText: string;
  simplifiedText: string;
  riskLevel: RiskLevel;
  riskExplanation: string;
  financialImpact?: string;
  detailedFinancials?: FinancialImpact;
  industryStandard: string;
  suggestedCounterProposal: string;
  negotiationScript: string;
  strategy: NegotiationStrategy;
  negotiabilityScore: number;
  negotiabilityExplanation: string;
  changeSummary: ChangeSummaryItem[];
  successStories: SuccessfulNegotiation[];
  stats: ClauseStatistics;
}

export interface ContractAnalysis {
  riskScore: number;
  summary: string;
  clauses: Clause[];
  overallRecommendation: string;
  totalPotentialExposure?: number;
  totalPotentialSavings?: number;
}

export interface ChatAction {
  label: string;
  type: 'email' | 'explanation' | 'legal' | 'success_story' | 'query';
  payload?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  content: string;
  actions?: ChatAction[];
  timestamp: Date;
}
