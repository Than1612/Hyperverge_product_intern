"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AIUnderwritingService = void 0;
const openai_1 = __importDefault(require("openai"));
const logger_1 = require("../../utils/logger");
const riskAssessment_1 = require("../../models/riskAssessment");
class AIUnderwritingService {
    constructor() {
        this.openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        this.riskModel = new riskAssessment_1.RiskAssessmentModel();
    }
    /**
     * Main underwriting function that orchestrates the entire process
     */
    async assessLoanApplication(application, user, documents, alternativeData) {
        try {
            logger_1.logger.info(`Starting AI underwriting for application ${application.id}`);
            // Step 1: Document verification and fraud detection
            const documentAnalysis = await this.analyzeDocuments(documents);
            // Step 2: Traditional credit assessment
            const traditionalScore = await this.calculateTraditionalScore(user, application);
            // Step 3: Alternative data analysis
            const alternativeScore = await this.calculateAlternativeScore(alternativeData);
            // Step 4: Rural-specific factors
            const ruralScore = await this.calculateRuralScore(user, application, alternativeData);
            // Step 5: ML-based risk prediction
            const mlPrediction = await this.predictRiskWithML({
                traditional: traditionalScore,
                alternative: alternativeScore,
                rural: ruralScore,
                documentAnalysis,
            });
            // Step 6: LLM-powered reasoning and explanation
            const llmAnalysis = await this.generateLLMAnalysis(application, user, documentAnalysis, mlPrediction);
            // Step 7: Final risk assessment
            const finalAssessment = await this.generateFinalAssessment(mlPrediction, llmAnalysis, application);
            logger_1.logger.info(`AI underwriting completed for application ${application.id}`);
            return finalAssessment;
        }
        catch (error) {
            logger_1.logger.error('AI underwriting failed:', error);
            throw new Error('Underwriting assessment failed');
        }
    }
    /**
     * Analyze documents using OCR and fraud detection
     */
    async analyzeDocuments(documents) {
        const analysis = {
            authenticity: 0,
            quality: 0,
            consistency: 0,
            fraudFlags: [],
        };
        for (const doc of documents) {
            // OCR text extraction
            const extractedText = await this.extractTextFromDocument(doc);
            // Document authenticity check
            const authenticity = await this.checkDocumentAuthenticity(doc, extractedText);
            analysis.authenticity += authenticity.score;
            // Quality assessment
            const quality = await this.assessDocumentQuality(doc);
            analysis.quality += quality.score;
            // Fraud detection
            const fraudCheck = await this.detectDocumentFraud(doc, extractedText);
            analysis.fraudFlags.push(...fraudCheck.flags);
        }
        // Average the scores
        analysis.authenticity /= documents.length;
        analysis.quality /= documents.length;
        return analysis;
    }
    /**
     * Calculate traditional credit score factors
     */
    async calculateTraditionalScore(user, application) {
        const factors = {
            income: 0,
            employment: 0,
            creditHistory: 0,
            debtToIncome: 0,
        };
        // Income assessment
        factors.income = this.assessIncomeStability(user.monthlyIncome, application.requestedAmount);
        // Employment stability
        factors.employment = this.assessEmploymentStability(user.occupation, user.employmentHistory);
        // Credit history (if available)
        factors.creditHistory = await this.assessCreditHistory(user.id);
        // Debt-to-income ratio
        factors.debtToIncome = this.calculateDebtToIncomeRatio(user.monthlyIncome, application.requestedAmount);
        return factors;
    }
    /**
     * Calculate alternative data score
     */
    async calculateAlternativeScore(alternativeData) {
        const factors = {
            mobileReliability: 0,
            utilityPayments: 0,
            socialStability: 0,
            behavioralPatterns: 0,
        };
        // Mobile usage reliability
        factors.mobileReliability = this.assessMobileReliability(alternativeData.mobileUsagePatterns);
        // Utility payment history
        factors.utilityPayments = this.assessUtilityPayments(alternativeData.utilityPayments);
        // Social stability
        factors.socialStability = this.assessSocialStability(alternativeData.socialConnections);
        // Behavioral patterns
        factors.behavioralPatterns = this.assessBehavioralPatterns(alternativeData.behavioralData);
        return factors;
    }
    /**
     * Calculate rural-specific factors
     */
    async calculateRuralScore(user, application, alternativeData) {
        const factors = {
            landOwnership: 0,
            cropPatterns: 0,
            seasonalIncome: 0,
            communityStanding: 0,
        };
        // Land ownership assessment
        factors.landOwnership = await this.assessLandOwnership(user, application);
        // Crop patterns and agricultural income
        factors.cropPatterns = await this.assessCropPatterns(user, application);
        // Seasonal income patterns
        factors.seasonalIncome = this.assessSeasonalIncome(user, alternativeData);
        // Community standing
        factors.communityStanding = await this.assessCommunityStanding(user, alternativeData);
        return factors;
    }
    /**
     * ML-based risk prediction
     */
    async predictRiskWithML(data) {
        try {
            // Prepare features for ML model
            const features = this.prepareMLFeatures(data);
            // Use trained ML model for prediction
            const prediction = await this.riskModel.predict(features);
            return {
                riskScore: prediction.riskScore,
                defaultProbability: prediction.defaultProbability,
                confidence: prediction.confidence,
                featureImportance: prediction.featureImportance,
            };
        }
        catch (error) {
            logger_1.logger.error('ML prediction failed:', error);
            // Fallback to rule-based scoring
            return this.fallbackRiskPrediction(data);
        }
    }
    /**
     * LLM-powered analysis and reasoning
     */
    async generateLLMAnalysis(application, user, documentAnalysis, mlPrediction) {
        try {
            const prompt = this.buildLLMPrompt(application, user, documentAnalysis, mlPrediction);
            const response = await this.openai.chat.completions.create({
                model: "gpt-4",
                messages: [
                    {
                        role: "system",
                        content: "You are an expert loan underwriter specializing in rural and semi-urban markets in India. Provide detailed analysis and reasoning for loan decisions."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],
                temperature: 0.3,
                max_tokens: 1000,
            });
            const analysis = JSON.parse(response.choices[0].message.content || '{}');
            return {
                reasoning: analysis.reasoning,
                strengths: analysis.strengths,
                concerns: analysis.concerns,
                recommendations: analysis.recommendations,
                riskFactors: analysis.riskFactors,
            };
        }
        catch (error) {
            logger_1.logger.error('LLM analysis failed:', error);
            return this.fallbackLLMAnalysis(application, user, mlPrediction);
        }
    }
    /**
     * Generate final risk assessment
     */
    async generateFinalAssessment(mlPrediction, llmAnalysis, application) {
        // Combine ML prediction with LLM analysis
        const combinedScore = this.combineScores(mlPrediction, llmAnalysis);
        // Determine risk category
        const riskCategory = this.determineRiskCategory(combinedScore);
        // Calculate approval probability
        const approvalProbability = this.calculateApprovalProbability(combinedScore, riskCategory);
        // Determine loan amount and interest rate
        const { recommendedAmount, interestRate } = this.determineLoanTerms(application.requestedAmount, combinedScore, riskCategory);
        // Generate reasoning
        const reasoning = this.generateReasoning(llmAnalysis, combinedScore, riskCategory);
        return {
            creditScore: Math.round(combinedScore * 850), // Scale to 850
            riskCategory,
            approvalProbability,
            recommendedAmount,
            interestRate,
            reasoning,
            factors: {
                traditional: mlPrediction.factors?.traditional || {},
                alternative: mlPrediction.factors?.alternative || {},
                rural: mlPrediction.factors?.rural || {},
            },
            flags: llmAnalysis.concerns || [],
        };
    }
    // Helper methods for individual assessments
    assessIncomeStability(monthlyIncome, requestedAmount) {
        const incomeRatio = requestedAmount / (monthlyIncome * 12);
        if (incomeRatio <= 0.3)
            return 0.9;
        if (incomeRatio <= 0.5)
            return 0.7;
        if (incomeRatio <= 0.8)
            return 0.5;
        return 0.3;
    }
    assessEmploymentStability(occupation, employmentHistory) {
        const stableOccupations = ['government', 'private', 'selfEmployed'];
        const unstableOccupations = ['dailyWage', 'seasonal'];
        if (stableOccupations.includes(occupation))
            return 0.8;
        if (unstableOccupations.includes(occupation))
            return 0.4;
        return 0.6;
    }
    async assessCreditHistory(userId) {
        // This would query the database for credit history
        // For now, return a default score
        return 0.5;
    }
    calculateDebtToIncomeRatio(monthlyIncome, requestedAmount) {
        const monthlyPayment = requestedAmount * 0.02; // Assuming 2% monthly payment
        const ratio = monthlyPayment / monthlyIncome;
        if (ratio <= 0.3)
            return 0.9;
        if (ratio <= 0.5)
            return 0.7;
        if (ratio <= 0.7)
            return 0.5;
        return 0.3;
    }
    assessMobileReliability(patterns) {
        let score = 0;
        // Call duration indicates stability
        if (patterns.callDuration > 100)
            score += 0.3;
        else if (patterns.callDuration > 50)
            score += 0.2;
        // Data usage indicates digital engagement
        if (patterns.dataUsage > 1000)
            score += 0.3;
        else if (patterns.dataUsage > 500)
            score += 0.2;
        // Top-up frequency indicates financial discipline
        if (patterns.topUpFrequency > 0.8)
            score += 0.2;
        else if (patterns.topUpFrequency > 0.5)
            score += 0.1;
        // Network reliability
        score += patterns.networkReliability * 0.2;
        return Math.min(score, 1);
    }
    assessUtilityPayments(payments) {
        let totalOnTime = 0;
        let totalPayments = 0;
        Object.values(payments).forEach(payment => {
            totalOnTime += payment.onTime;
            totalPayments += payment.total;
        });
        if (totalPayments === 0)
            return 0.5; // No data available
        return totalOnTime / totalPayments;
    }
    assessSocialStability(connections) {
        let score = 0;
        // Family size indicates stability
        if (connections.familySize >= 2 && connections.familySize <= 6)
            score += 0.4;
        // Community involvement
        score += connections.communityInvolvement * 0.3;
        // Reference quality
        score += connections.referenceQuality * 0.3;
        return Math.min(score, 1);
    }
    assessBehavioralPatterns(behavioral) {
        let score = 0;
        // Response time indicates engagement
        if (behavioral.responseTime < 24)
            score += 0.4; // Hours
        else if (behavioral.responseTime < 72)
            score += 0.2;
        // Completion rate
        score += behavioral.completionRate * 0.6;
        return Math.min(score, 1);
    }
    async assessLandOwnership(user, application) {
        // This would check land records or user-provided information
        // For now, return a default score
        return 0.5;
    }
    async assessCropPatterns(user, application) {
        // This would analyze agricultural patterns and income
        // For now, return a default score
        return 0.5;
    }
    assessSeasonalIncome(user, alternativeData) {
        // Analyze seasonal income patterns
        // For now, return a default score
        return 0.5;
    }
    async assessCommunityStanding(user, alternativeData) {
        // This would check community references and standing
        // For now, return a default score
        return 0.5;
    }
    prepareMLFeatures(data) {
        // Convert all assessment data into a feature vector for ML model
        const features = [];
        // Traditional factors
        features.push(data.traditional.income);
        features.push(data.traditional.employment);
        features.push(data.traditional.creditHistory);
        features.push(data.traditional.debtToIncome);
        // Alternative factors
        features.push(data.alternative.mobileReliability);
        features.push(data.alternative.utilityPayments);
        features.push(data.alternative.socialStability);
        features.push(data.alternative.behavioralPatterns);
        // Rural factors
        features.push(data.rural.landOwnership);
        features.push(data.rural.cropPatterns);
        features.push(data.rural.seasonalIncome);
        features.push(data.rural.communityStanding);
        // Document analysis
        features.push(data.documentAnalysis.authenticity);
        features.push(data.documentAnalysis.quality);
        return features;
    }
    fallbackRiskPrediction(data) {
        // Simple rule-based fallback
        const traditionalScore = Object.values(data.traditional).reduce((a, b) => a + b, 0) / 4;
        const alternativeScore = Object.values(data.alternative).reduce((a, b) => a + b, 0) / 4;
        const ruralScore = Object.values(data.rural).reduce((a, b) => a + b, 0) / 4;
        const combinedScore = (traditionalScore * 0.4 + alternativeScore * 0.4 + ruralScore * 0.2);
        return {
            riskScore: combinedScore,
            defaultProbability: 1 - combinedScore,
            confidence: 0.7,
            featureImportance: {
                traditional: 0.4,
                alternative: 0.4,
                rural: 0.2,
            },
        };
    }
    buildLLMPrompt(application, user, documentAnalysis, mlPrediction) {
        return `
Analyze this loan application for a rural/semi-urban borrower in India:

BORROWER PROFILE:
- Name: ${user.name}
- Age: ${user.age}
- Occupation: ${user.occupation}
- Monthly Income: ₹${user.monthlyIncome}
- Location: ${user.address}
- Family Size: ${user.familyMembers}

LOAN REQUEST:
- Amount: ₹${application.requestedAmount}
- Purpose: ${application.purpose}
- Duration: ${application.duration} months

DOCUMENT ANALYSIS:
- Authenticity Score: ${documentAnalysis.authenticity}
- Quality Score: ${documentAnalysis.quality}
- Fraud Flags: ${documentAnalysis.fraudFlags.join(', ')}

ML PREDICTION:
- Risk Score: ${mlPrediction.riskScore}
- Default Probability: ${mlPrediction.defaultProbability}
- Confidence: ${mlPrediction.confidence}

Please provide a detailed analysis including:
1. Key strengths of this application
2. Potential concerns or risk factors
3. Specific recommendations for this borrower
4. Reasoning for the risk assessment
5. Any additional factors to consider for rural lending

Respond in JSON format with the following structure:
{
  "reasoning": "Detailed explanation of the assessment",
  "strengths": ["strength1", "strength2"],
  "concerns": ["concern1", "concern2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "riskFactors": ["factor1", "factor2"]
}
    `;
    }
    fallbackLLMAnalysis(application, user, mlPrediction) {
        return {
            reasoning: `Based on the available data, this application shows ${mlPrediction.riskScore > 0.7 ? 'strong' : 'moderate'} creditworthiness.`,
            strengths: ['Regular income', 'Stable occupation'],
            concerns: ['Limited credit history'],
            recommendations: ['Consider lower loan amount', 'Monitor repayment closely'],
            riskFactors: ['Income volatility', 'Seasonal employment'],
        };
    }
    combineScores(mlPrediction, llmAnalysis) {
        // Weighted combination of ML prediction and LLM analysis
        const mlWeight = 0.7;
        const llmWeight = 0.3;
        // Convert LLM analysis to numeric score
        const llmScore = this.convertLLMToScore(llmAnalysis);
        return mlPrediction.riskScore * mlWeight + llmScore * llmWeight;
    }
    convertLLMToScore(llmAnalysis) {
        let score = 0.5; // Base score
        // Adjust based on strengths and concerns
        score += llmAnalysis.strengths?.length * 0.1;
        score -= llmAnalysis.concerns?.length * 0.1;
        return Math.max(0, Math.min(1, score));
    }
    determineRiskCategory(score) {
        if (score >= 0.8)
            return 'LOW';
        if (score >= 0.6)
            return 'MEDIUM';
        if (score >= 0.4)
            return 'HIGH';
        return 'VERY_HIGH';
    }
    calculateApprovalProbability(score, riskCategory) {
        const baseProbabilities = {
            LOW: 0.9,
            MEDIUM: 0.7,
            HIGH: 0.4,
            VERY_HIGH: 0.1,
        };
        return baseProbabilities[riskCategory] || 0.1;
    }
    determineLoanTerms(requestedAmount, score, riskCategory) {
        const maxAmounts = {
            LOW: 1.0,
            MEDIUM: 0.8,
            HIGH: 0.6,
            VERY_HIGH: 0.4,
        };
        const baseRates = {
            LOW: 0.12,
            MEDIUM: 0.15,
            HIGH: 0.18,
            VERY_HIGH: 0.22,
        };
        const recommendedAmount = requestedAmount * (maxAmounts[riskCategory] || 0.4);
        const interestRate = baseRates[riskCategory] || 0.22;
        return { recommendedAmount, interestRate };
    }
    generateReasoning(llmAnalysis, score, riskCategory) {
        return llmAnalysis.reasoning || `Based on our comprehensive assessment, this application has been categorized as ${riskCategory} risk with a score of ${(score * 100).toFixed(1)}%.`;
    }
    async extractTextFromDocument(doc) {
        // This would use OCR to extract text from the document
        // For now, return empty string
        return '';
    }
    async checkDocumentAuthenticity(doc, extractedText) {
        // This would check document authenticity
        // For now, return a default score
        return { score: 0.8 };
    }
    async assessDocumentQuality(doc) {
        // This would assess document quality
        // For now, return a default score
        return { score: 0.8 };
    }
    async detectDocumentFraud(doc, extractedText) {
        // This would detect document fraud
        // For now, return no flags
        return { flags: [] };
    }
}
exports.AIUnderwritingService = AIUnderwritingService;
//# sourceMappingURL=underwritingService.js.map