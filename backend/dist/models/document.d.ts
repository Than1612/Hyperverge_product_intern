export interface Document {
    id: string;
    userId: string;
    type: 'aadhaar' | 'pan' | 'income_proof' | 'address_proof';
    fileName: string;
    filePath: string;
    status: 'pending' | 'verified' | 'rejected';
    uploadedAt: Date;
    verifiedAt?: Date;
    extractedData?: any;
    confidence?: number;
}
//# sourceMappingURL=document.d.ts.map