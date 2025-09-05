import Queue from 'bull';
import { logger } from '../utils/logger';

let queues: { [key: string]: Queue.Queue } = {};

export const initializeQueues = (): void => {
  try {
    // Document processing queue
    queues.documentProcessing = new Queue('document processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    // Email queue
    queues.email = new Queue('email', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    // AI processing queue
    queues.aiProcessing = new Queue('ai processing', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });

    // Set up queue processors
    setupQueueProcessors();

    logger.info('Queues initialized successfully');
  } catch (error) {
    logger.error('Queue initialization failed:', error);
    throw error;
  }
};

const setupQueueProcessors = (): void => {
  // Document processing processor
  queues.documentProcessing.process('process-document', async (job) => {
    const { documentId, userId } = job.data;
    logger.info(`Processing document ${documentId} for user ${userId}`);
    // Add document processing logic here
  });

  // Email processor
  queues.email.process('send-email', async (job) => {
    const { to, subject, body } = job.data;
    logger.info(`Sending email to ${to}`);
    // Add email sending logic here
  });

  // AI processing processor
  queues.aiProcessing.process('ai-analysis', async (job) => {
    const { applicationId, data } = job.data;
    logger.info(`Processing AI analysis for application ${applicationId}`);
    // Add AI processing logic here
  });
};

export const getQueue = (name: string): Queue.Queue => {
  if (!queues[name]) {
    throw new Error(`Queue ${name} not found`);
  }
  return queues[name];
};

export const closeQueues = async (): Promise<void> => {
  await Promise.all(
    Object.values(queues).map(queue => queue.close())
  );
  logger.info('All queues closed');
};
