# Rural Loan AI - API Documentation

## Overview

The Rural Loan AI API provides comprehensive endpoints for loan underwriting, user management, document processing, and AI-powered risk assessment. This API is designed to serve rural and semi-urban markets in India with features optimized for low-bandwidth environments and users with varying digital literacy levels.

## Base URL

- **Development**: `http://localhost:3000/api`
- **Production**: `https://api.ruralloanai.com/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

- **General API**: 100 requests per 15 minutes per IP
- **Authentication**: 5 requests per 15 minutes per IP
- **Document Upload**: 10 requests per hour per user

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": {},
  "message": "Success message",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## API Endpoints

### Authentication

#### POST /auth/register
Register a new user with phone number.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "name": "Rajesh Kumar",
  "language": "hi"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "otpSent": true,
    "expiresIn": 300
  },
  "message": "OTP sent successfully"
}
```

#### POST /auth/verify-otp
Verify OTP and complete registration.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user_123",
      "phoneNumber": "+919876543210",
      "name": "Rajesh Kumar",
      "isVerified": true
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Authentication successful"
}
```

#### POST /auth/login
Login with phone number and OTP.

**Request Body:**
```json
{
  "phoneNumber": "+919876543210",
  "otp": "123456"
}
```

#### POST /auth/refresh
Refresh access token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### POST /auth/logout
Logout and invalidate tokens.

### User Management

#### GET /users/profile
Get current user profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123",
    "phoneNumber": "+919876543210",
    "name": "Rajesh Kumar",
    "email": "rajesh@example.com",
    "address": {
      "street": "Village Road",
      "city": "Mumbai",
      "state": "Maharashtra",
      "pincode": "400001"
    },
    "occupation": "farmer",
    "monthlyIncome": 25000,
    "familyMembers": 4,
    "language": "hi",
    "isVerified": true,
    "creditScore": 720,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

#### PUT /users/profile
Update user profile.

**Request Body:**
```json
{
  "name": "Rajesh Kumar",
  "email": "rajesh@example.com",
  "address": {
    "street": "Village Road",
    "city": "Mumbai",
    "state": "Maharashtra",
    "pincode": "400001"
  },
  "occupation": "farmer",
  "monthlyIncome": 30000,
  "familyMembers": 4
}
```

#### POST /users/upload-document
Upload identity or income documents.

**Request Body (multipart/form-data):**
```
file: <document-image>
type: "aadhaar" | "pan" | "income_proof" | "address_proof"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "type": "aadhaar",
    "status": "processing",
    "uploadedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Loan Applications

#### POST /loans/apply
Submit a new loan application.

**Request Body:**
```json
{
  "amount": 25000,
  "purpose": "agriculture",
  "duration": 12,
  "monthlyIncome": 30000,
  "occupation": "farmer",
  "familyMembers": 4,
  "emergencyContact": "+919876543211",
  "bankAccount": {
    "accountNumber": "1234567890",
    "ifscCode": "SBIN0001234",
    "accountHolderName": "Rajesh Kumar"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_123",
    "status": "submitted",
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "estimatedProcessingTime": "5 minutes"
  }
}
```

#### GET /loans/applications
Get user's loan applications.

**Query Parameters:**
- `status`: Filter by status (optional)
- `limit`: Number of results (default: 10)
- `offset`: Pagination offset (default: 0)

**Response:**
```json
{
  "success": true,
  "data": {
    "applications": [
      {
        "id": "app_123",
        "amount": 25000,
        "purpose": "agriculture",
        "status": "approved",
        "submittedAt": "2024-01-01T00:00:00.000Z",
        "processedAt": "2024-01-01T00:05:00.000Z",
        "creditScore": 720,
        "interestRate": 0.15
      }
    ],
    "pagination": {
      "total": 1,
      "limit": 10,
      "offset": 0,
      "hasMore": false
    }
  }
}
```

#### GET /loans/applications/:id
Get specific loan application details.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "app_123",
    "amount": 25000,
    "purpose": "agriculture",
    "duration": 12,
    "status": "approved",
    "creditScore": 720,
    "interestRate": 0.15,
    "monthlyPayment": 2250,
    "totalAmount": 27000,
    "submittedAt": "2024-01-01T00:00:00.000Z",
    "processedAt": "2024-01-01T00:05:00.000Z",
    "riskAssessment": {
      "category": "LOW",
      "probability": 0.9,
      "reasoning": "Strong credit profile with stable income"
    },
    "documents": [
      {
        "id": "doc_123",
        "type": "aadhaar",
        "status": "verified",
        "uploadedAt": "2024-01-01T00:00:00.000Z"
      }
    ]
  }
}
```

#### GET /loans/status/:id
Get real-time loan application status.

**Response:**
```json
{
  "success": true,
  "data": {
    "applicationId": "app_123",
    "status": "processing",
    "currentStep": "document_verification",
    "progress": 60,
    "estimatedCompletion": "2024-01-01T00:03:00.000Z",
    "steps": [
      {
        "name": "application_submitted",
        "status": "completed",
        "completedAt": "2024-01-01T00:00:00.000Z"
      },
      {
        "name": "document_verification",
        "status": "in_progress",
        "startedAt": "2024-01-01T00:01:00.000Z"
      },
      {
        "name": "ai_assessment",
        "status": "pending"
      },
      {
        "name": "final_decision",
        "status": "pending"
      }
    ]
  }
}
```

### AI Services

#### POST /ai/assess-risk
Perform AI-powered risk assessment.

**Request Body:**
```json
{
  "applicationId": "app_123",
  "alternativeData": {
    "mobileUsagePatterns": {
      "callDuration": 120,
      "dataUsage": 2000,
      "topUpFrequency": 0.8,
      "networkReliability": 0.9
    },
    "utilityPayments": {
      "electricity": { "onTime": 10, "total": 12 },
      "water": { "onTime": 8, "total": 8 },
      "gas": { "onTime": 6, "total": 6 }
    },
    "socialConnections": {
      "familySize": 4,
      "communityInvolvement": 0.7,
      "referenceQuality": 0.8
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "riskScore": 0.85,
    "riskCategory": "LOW",
    "approvalProbability": 0.9,
    "recommendedAmount": 25000,
    "interestRate": 0.15,
    "reasoning": "Strong credit profile with stable income and good payment history",
    "factors": {
      "traditional": {
        "income": 0.8,
        "employment": 0.9,
        "creditHistory": 0.7,
        "debtToIncome": 0.8
      },
      "alternative": {
        "mobileReliability": 0.9,
        "utilityPayments": 0.8,
        "socialStability": 0.8,
        "behavioralPatterns": 0.7
      },
      "rural": {
        "landOwnership": 0.6,
        "cropPatterns": 0.7,
        "seasonalIncome": 0.8,
        "communityStanding": 0.9
      }
    },
    "flags": [],
    "processingTime": 2.5
  }
}
```

#### POST /ai/chat
Interact with AI loan counselor.

**Request Body:**
```json
{
  "message": "What documents do I need for a loan?",
  "context": {
    "userId": "user_123",
    "language": "hi",
    "applicationId": "app_123"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "response": "आपको लोन के लिए निम्नलिखित दस्तावेजों की आवश्यकता है: आधार कार्ड, PAN कार्ड, आय प्रमाण, और पता प्रमाण।",
    "suggestions": [
      "आधार कार्ड अपलोड करें",
      "PAN कार्ड अपलोड करें",
      "आय प्रमाण अपलोड करें"
    ],
    "language": "hi",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Document Processing

#### POST /documents/verify
Verify uploaded documents using AI.

**Request Body:**
```json
{
  "documentId": "doc_123",
  "verificationType": "aadhaar"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "status": "verified",
    "confidence": 0.95,
    "extractedData": {
      "name": "Rajesh Kumar",
      "aadhaarNumber": "123456789012",
      "dateOfBirth": "1990-01-01",
      "address": "Village Road, Mumbai, Maharashtra 400001"
    },
    "verificationResults": {
      "authenticity": 0.95,
      "quality": 0.90,
      "fraudFlags": []
    },
    "processedAt": "2024-01-01T00:00:00.000Z"
  }
}

#### GET /documents/:id/status
Get document processing status.

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "doc_123",
    "status": "processing",
    "progress": 75,
    "currentStep": "ocr_extraction",
    "estimatedCompletion": "2024-01-01T00:01:00.000Z"
  }
}
```

### Analytics and Reporting

#### GET /analytics/dashboard
Get user dashboard analytics.

**Response:**
```json
{
  "success": true,
  "data": {
    "creditScore": 720,
    "creditScoreHistory": [
      { "date": "2024-01-01", "score": 720 },
      { "date": "2023-12-01", "score": 710 }
    ],
    "loanHistory": {
      "totalApplications": 3,
      "approvedApplications": 2,
      "totalBorrowed": 50000,
      "totalRepaid": 30000,
      "outstandingAmount": 20000
    },
    "paymentHistory": [
      {
        "date": "2024-01-01",
        "amount": 2500,
        "status": "paid",
        "loanId": "loan_123"
      }
    ],
    "recommendations": [
      "Your credit score has improved by 10 points this month",
      "Consider applying for a higher loan amount next time"
    ]
  }
}
```

#### GET /analytics/usage
Get app usage analytics.

**Query Parameters:**
- `period`: Time period (7d, 30d, 90d)
- `metrics`: Comma-separated metrics

**Response:**
```json
{
  "success": true,
  "data": {
    "period": "30d",
    "metrics": {
      "totalSessions": 45,
      "averageSessionDuration": 480,
      "featuresUsed": {
        "voiceInput": 12,
        "documentUpload": 8,
        "aiChat": 15
      },
      "languageUsage": {
        "hi": 25,
        "en": 15,
        "te": 5
      }
    }
  }
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INVALID_OTP` | Invalid OTP provided |
| `USER_NOT_FOUND` | User not found |
| `APPLICATION_NOT_FOUND` | Loan application not found |
| `DOCUMENT_NOT_FOUND` | Document not found |
| `INVALID_DOCUMENT` | Invalid document format |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `INSUFFICIENT_DATA` | Insufficient data for processing |
| `AI_SERVICE_ERROR` | AI service temporarily unavailable |
| `VALIDATION_ERROR` | Request validation failed |
| `INTERNAL_ERROR` | Internal server error |

## Webhooks

### Loan Status Updates

**Endpoint**: `POST /webhooks/loan-status`

**Payload:**
```json
{
  "event": "loan.status.updated",
  "data": {
    "applicationId": "app_123",
    "status": "approved",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Document Verification

**Endpoint**: `POST /webhooks/document-verified`

**Payload:**
```json
{
  "event": "document.verified",
  "data": {
    "documentId": "doc_123",
    "status": "verified",
    "confidence": 0.95,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## SDKs and Libraries

### JavaScript/TypeScript

```bash
npm install @ruralloanai/sdk
```

```javascript
import { RuralLoanAPI } from '@ruralloanai/sdk';

const api = new RuralLoanAPI({
  baseURL: 'https://api.ruralloanai.com',
  apiKey: 'your-api-key'
});

// Submit loan application
const application = await api.loans.apply({
  amount: 25000,
  purpose: 'agriculture',
  duration: 12
});
```

### React Native

```bash
npm install @ruralloanai/react-native
```

```javascript
import { RuralLoanSDK } from '@ruralloanai/react-native';

const sdk = new RuralLoanSDK({
  apiKey: 'your-api-key',
  environment: 'production'
});
```

## Testing

### Postman Collection

Import the Postman collection for testing:
- [Rural Loan AI API Collection](./postman/RuralLoanAI.postman_collection.json)

### Test Environment

- **Base URL**: `https://api-test.ruralloanai.com`
- **Test Credentials**: Available in the test environment documentation

## Support

For API support and questions:
- **Email**: api-support@ruralloanai.com
- **Documentation**: https://docs.ruralloanai.com
- **Status Page**: https://status.ruralloanai.com
