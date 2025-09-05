export declare class RiskAssessmentModel {
    predict(features: number[]): Promise<{
        riskScore: number;
        defaultProbability: number;
        confidence: number;
        featureImportance: any;
    }>;
}
//# sourceMappingURL=riskAssessment.d.ts.map