import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.AI_PORT || process.env.PORT || 5000;

app.use(helmet());
app.use(cors());
app.use(compression());
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));

app.get('/health', (_req, res) => {
  res.json({ success: true, service: 'ai-services', status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/assess-risk', (req, res) => {
  const { applicationId } = req.body || {};
  res.json({ success: true, applicationId, riskScore: 0.78, decision: 'approve', confidence: 0.88 });
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`AI Services listening on port ${PORT}`);
});
