import pino from 'pino';
import { join } from 'path';
import { format } from 'date-fns';

// Create logs directory if it doesn't exist
const logsDir = join(process.cwd(), 'logs');
const today = format(new Date(), 'yyyy-MM-dd');
const logFile = join(logsDir, `${today}.log`);

const logger = pino({
  transport: {
    targets: [
      {
        target: 'pino-pretty',
        level: 'info',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{time} [{level}] {msg}',
          destination: 1 // stdout
        }
      },
      {
        target: 'pino-pretty',
        level: 'info',
        options: {
          colorize: false,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
          messageFormat: '{time} [{level}] {msg}',
          destination: logFile
        }
      }
    ]
  }
});

export default logger; 