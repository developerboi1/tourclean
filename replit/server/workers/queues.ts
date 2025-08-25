import { Queue } from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');

export const ingestQueue = new Queue('ingest', { connection });
export const analyzeQueue = new Queue('analyze', { connection });
export const validateQueue = new Queue('validate', { connection });
export const decideQueue = new Queue('decide', { connection });

export type IngestJob = { submissionId: string };
