import { LoanApplication } from '../../models/loanApplication';
import { User } from '../../models/user';
import { Document } from '../../models/document';
interface AlternativeData {
    mobileUsagePatterns: {
        callDuration: number;
        dataUsage: number;
        topUpFrequency: number;
        networkReliability: number;
    };
    utilityPayments: {
        electricity: {
            onTime: number;
            total: number;
        };
        water: {
            onTime: number;
            total: number;
        };
        gas: {
            onTime: number;
            total: number;
        };
    };
    socialConnections: {
        familySize: number;
        communityInvolvement: number;
        referenceQuality: number;
    };
    behavioralData: {
        appUsagePatterns: any;
        responseTime: number;
        completionRate: number;
    };
}
interface CreditScoreFactors {
    traditional: {
        income: number;
        employment: number;
        creditHistory: number;
        debtToIncome: number;
    };
    alternative: {
        mobileReliability: number;
        utilityPayments: number;
        socialStability: number;
        behavioralPatterns: number;
    };
    rural: {
        landOwnership: number;
        cropPatterns: number;
        seasonalIncome: number;
        communityStanding: number;
    };
}
interface RiskAssessment {
    creditScore: number;
    riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
    approvalProbability: number;
    recommendedAmount: number;
    interestRate: number;
    reasoning: string;
    factors: CreditScoreFactors;
    flags: string[];
}
export declare class AIUnderwritingService {
    private openai;
    private riskModel;
    constructor();
    /**
     * Main underwriting function that orchestrates the entire process
     */
    assessLoanApplication(application: LoanApplication, user: User, documents: Document[], alternativeData: AlternativeData): Promise<RiskAssessment>;
    /**
     * Analyze documents using OCR and fraud detection
     */
    private analyzeDocuments;
    /**
     * Calculate traditional credit score factors
     */
    private calculateTraditionalScore;
    /**
     * Calculate alternative data score
     */
    private calculateAlternativeScore;
    /**
     * Calculate rural-specific factors
     */
    private calculateRuralScore;
    /**
     * ML-based risk prediction
     */
    private predictRiskWithML;
    /**
     * LLM-powered analysis and reasoning
     */
    private generateLLMAnalysis;
    /**
     * Generate final risk assessment
     */
    private generateFinalAssessment;
    private assessIncomeStability;
    private assessEmploymentStability;
    private assessCreditHistory;
    private calculateDebtToIncomeRatio;
    private assessMobileReliability;
    private assessUtilityPayments;
    private assessSocialStability;
    private assessBehavioralPatterns;
    private assessLandOwnership;
    private assessCropPatterns;
    private assessSeasonalIncome;
    private assessCommunityStanding;
    private prepareMLFeatures;
    private fallbackRiskPrediction;
    private buildLLMPrompt;
    private fallbackLLMAnalysis;
    private combineScores;
    private convertLLMToScore;
    private determineRiskCategory;
    private calculateApprovalProbability;
    private determineLoanTerms;
    private generateReasoning;
    private extractTextFromDocument;
    private checkDocumentAuthenticity;
    private assessDocumentQuality;
    private detectDocumentFraud;
}
export {};
//# sourceMappingURL=underwritingService.d.ts.map