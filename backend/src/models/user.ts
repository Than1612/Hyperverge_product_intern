export interface User {
  id: string;
  phoneNumber: string;
  name: string;
  email?: string;
  age?: number;
  address?: string;
  occupation: string;
  monthlyIncome: number;
  familyMembers: number;
  employmentHistory?: any;
  language: string;
  isVerified: boolean;
  profileComplete: boolean;
  creditScore?: number;
  createdAt: Date;
  updatedAt: Date;
}
