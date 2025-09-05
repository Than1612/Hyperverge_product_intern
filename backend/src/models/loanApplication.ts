export interface LoanApplication {
  id: string;
  userId: string;
  requestedAmount: number;
  purpose: string;
  duration: number;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  submittedAt: Date;
  processedAt?: Date;
  creditScore?: number;
  interestRate?: number;
  monthlyPayment?: number;
  totalAmount?: number;
}
