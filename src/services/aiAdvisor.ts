import { AssessmentResult, CompanyProfile, IndustryLandscapeData } from '../types';
import { generateIndustryLandscape } from '../utils/mlEngine';

export interface AIAnalysisResponse {
  executiveSummary?: string;
  competitiveEdge?: string;
  criticalBottlenecks?: string[];
  aiActionRoadmap?: Array<{
    timeframe: string;
    actionTitle: string;
    impact: string;
    steps: string[];
  }>;
  projectedRevenueGrowth?: string;
  recommendedAgencies?: string[];
}

export async function requestAIGrowthRecommendations(
  assessment: AssessmentResult
): Promise<AIAnalysisResponse | null> {
  try {
    const res = await fetch('/api/analyze-assessment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyProfile: assessment.companyProfile,
        categoryScores: assessment.categoryScores,
        overallPercentage: assessment.overallPercentage,
        maturityTitle: assessment.maturityTitle,
      }),
    });

    if (!res.ok) {
      console.warn('AI analysis HTTP error:', res.status);
      return null;
    }

    const json = await res.json();
    if (json.success && json.data) {
      return json.data as AIAnalysisResponse;
    }
    return null;
  } catch (err) {
    console.warn('AI analysis request failed, falling back to local ML engine:', err);
    return null;
  }
}

export async function requestAIIndustryLandscape(
  companyProfile: CompanyProfile
): Promise<IndustryLandscapeData | null> {
  try {
    const res = await fetch('/api/generate-industry-landscape', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyProfile,
      }),
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data && json.data.sectorOverview) {
        return json.data as IndustryLandscapeData;
      }
    }
  } catch (err) {
    console.warn('AI industry landscape request failed, using rules engine:', err);
  }

  // Resilient fallback based on sector and years of operation
  return generateIndustryLandscape(companyProfile);
}
