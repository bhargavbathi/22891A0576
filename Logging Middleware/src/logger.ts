export interface LogRequest {
  stack: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  packageName: string;
  message: string;
}

export interface LogResponse {
  logID: string;
  timestamp: string;
  status: 'success' | 'error';
}

export class Logger {
  private static readonly API_URL = 'http://20.244.56.144/evaluation-service/logs';

  static async Log(
    stack: string,
    level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG',
    packageName: string,
    message: string
  ): Promise<LogResponse | null> {
    try {
      const logRequest: LogRequest = {
        stack,
        level,
        packageName,
        message
      };

      const response = await fetch(this.API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logRequest)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const logResponse: LogResponse = await response.json();
      return logResponse;
    } catch (error) {
      // Since we can't use console.log, we'll return null on error
      // In a real scenario, this might need alternative error handling
      return null;
    }
  }
}

export default Logger;
