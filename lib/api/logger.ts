interface RequestLog {
  timestamp: string;
  method: string;
  path: string;
  message: string;
  responseTime: number;
  success: boolean;
}

const logs: RequestLog[] = [];
const MAX_LOGS = 100;

export function logRequest(log: RequestLog) {
  logs.unshift(log);
  if (logs.length > MAX_LOGS) {
    logs.pop();
  }

  // Console log in development
  if (process.env.NODE_ENV === 'development') {
    const emoji = log.success ? '✅' : '❌';
    console.log(
      `${emoji} [${log.method}] ${log.path} - ${log.message} (${log.responseTime}ms)`
    );
  }
}

export function getLogs(): RequestLog[] {
  return logs;
}
