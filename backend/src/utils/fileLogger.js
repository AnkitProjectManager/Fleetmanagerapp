// Simple file logger
import fs from 'fs';
import path from 'path';

const logFile = path.join(process.cwd(), 'debug.log');

export const fileLog = (...args) => {
  const timestamp = new Date().toISOString();
  const message = args.map(arg => 
    typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
  ).join(' ');
  const logMessage = `[${timestamp}] ${message}\n`;
  
  fs.appendFileSync(logFile, logMessage);
  console.log(...args); // Also log to console
};

// Clear log file on startup
fs.writeFileSync(logFile, `=== Log started at ${new Date().toISOString()} ===\n`);
