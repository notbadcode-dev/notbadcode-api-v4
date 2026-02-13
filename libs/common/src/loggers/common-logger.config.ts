import * as fs from 'fs';
import * as path from 'path';

import { format, type TransformableInfo } from 'logform';
import { transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { LoggerConstants } from '@common/constants';
import { ELoggerLevel } from '@common/enums';

import type winston from 'winston';

interface ServiceInfo extends TransformableInfo {
  service?: string;
}

export function loggerConfiguration(): winston.LoggerOptions {
  const logsDir = path.resolve(process.cwd(), LoggerConstants.path);
  const serviceName = process.env.SERVICE_NAME ?? LoggerConstants.defaultServiceName;
  const logLevel = process.env.LOG_LEVEL ?? LoggerConstants.defaultLogLevel;

  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }

  const printfFormatter = (info: winston.Logform.TransformableInfo): string => {
    const { level, message, ...meta } = info;
    const ts =
      (info as winston.Logform.TransformableInfo & { timestamp?: string }).timestamp ??
      new Date().toISOString();

    return LoggerConstants.defaultFormat(
      serviceName,
      ts,
      level,
      String(message),
      meta as Record<string, unknown>,
    );
  };

  const consoleFormat = format.combine(format.timestamp(), format.printf(printfFormatter));

  const attachService = format((info: ServiceInfo) => {
    info.service = serviceName;
    return info;
  });

  const fileFormat = format.combine(format.timestamp(), attachService(), format.json());

  const createDailyRotateFile = (filename: string, level?: ELoggerLevel): DailyRotateFile => {
    return new DailyRotateFile({
      dirname: logsDir,
      filename,
      datePattern: LoggerConstants.defaultDatePattern,
      zippedArchive: true,
      maxFiles: LoggerConstants.defaultMaxFiles,
      format: fileFormat,
      ...(level ? { level } : {}),
    });
  };

  return {
    level: logLevel,
    transports: [
      new transports.Console({ format: consoleFormat }),
      createDailyRotateFile(LoggerConstants.defaultAppFilename),
      createDailyRotateFile(LoggerConstants.defaultErrorFilename, ELoggerLevel.Error),
    ],
  };
}
