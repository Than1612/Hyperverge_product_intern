import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { logger } from './utils/logger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Rural Loan AI Backend is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Rural Loan AI API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      user: '/api/user',
      loan: '/api/loan',
      document: '/api/document',
      ai: '/api/ai',
      admin: '/api/admin',
    },
  });
});

// Auth routes
app.post('/api/auth/login', (req, res) => {
  const { phoneNumber, otp } = req.body;
  
  logger.info('Login attempt', { phoneNumber });
  
  res.json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: '1',
        phoneNumber,
        name: 'Test User',
      },
      token: 'mock-jwt-token',
    },
  });
});

app.post('/api/auth/send-otp', (req, res) => {
  const { phoneNumber } = req.body;
  
  logger.info('OTP request', { phoneNumber });
  
  res.json({
    success: true,
    message: 'OTP sent successfully',
  });
});

// User routes
app.get('/api/user/profile', (req, res) => {
  res.json({
    success: true,
    data: {
      user: {
        id: '1',
        name: 'Test User',
        phoneNumber: '+919876543210',
        email: 'test@example.com',
        address: 'Test Address',
        occupation: 'Farmer',
        monthlyIncome: 25000,
        familyMembers: 4,
        emergencyContact: '+919876543211',
        bankAccount: {
          accountNumber: '1234567890',
          ifscCode: 'SBIN0001234',
          accountHolderName: 'Test User',
        },
      },
    },
  });
});

// Loan routes
app.post('/api/loan/apply', (req, res) => {
  const loanData = req.body;
  
  logger.info('Loan application request', { loanData });
  
  res.json({
    success: true,
    message: 'Loan application submitted successfully',
    data: {
      applicationId: 'APP-123456',
      status: 'pending',
      estimatedProcessingTime: '24-48 hours',
    },
  });
});

app.get('/api/loan/status/:applicationId', (req, res) => {
  const { applicationId } = req.params;
  
  res.json({
    success: true,
    data: {
      applicationId,
      status: 'approved',
      amount: 25000,
      interestRate: 12.5,
      tenure: 12,
      monthlyEMI: 2200,
      disbursedDate: '2024-01-15',
      dueDate: '2024-02-15',
      remainingAmount: 25000,
    },
  });
});

// AI routes
app.post('/api/ai/underwrite', (req, res) => {
  const { applicationId, userData, documents } = req.body;
  
  logger.info('AI underwriting request', { applicationId });
  
  res.json({
    success: true,
    data: {
      applicationId,
      riskScore: 0.75,
      riskLevel: 'medium',
      decision: 'approved',
      approvedAmount: 25000,
      interestRate: 12.5,
      tenure: 12,
      monthlyEMI: 2200,
      reasoning: 'Based on traditional credit scoring, alternative data analysis, and rural-specific factors, the applicant shows moderate risk with good repayment potential.',
      confidence: 0.85,
    },
  });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: {
      message: 'Internal Server Error',
    },
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
    },
  });
});

// Start server
app.listen(PORT, () => {
  logger.info(`🚀 Rural Loan AI Backend running on port ${PORT}`);
  logger.info(`📊 Health check: http://localhost:${PORT}/health`);
  logger.info(`📚 API docs: http://localhost:${PORT}/api`);
});

export default app;
