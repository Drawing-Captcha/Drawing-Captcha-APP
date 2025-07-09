const winston = require('winston');
const { LoggerProvider, BatchLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { resourceFromAttributes } = require('@opentelemetry/resources')
const { ATTR_SERVICE_NAME, ATTR_SERVICE_VERSION } = require('@opentelemetry/semantic-conventions')
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

let transports;

const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.errors({ stack: true }),
  winston.format.printf(
    (info) => {
      const stack = info.stack ? `\n${info.stack}` : '';
      return `${info.timestamp} ${info.level}: ${info.message}${stack}`;
    }
  )
);

if (process.env.OTEL_EXPORTER_OTLP_ENDPOINT) {
  const otlpExporter = new OTLPLogExporter({
    url: process.env.OTEL_EXPORTER_OTLP_ENDPOINT,
  });

  const otelProvider = new LoggerProvider({
    resource: resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "Drawing-Captcha-Logger",
      [ATTR_SERVICE_VERSION]: "process.env.OTEL_SERVICE_VERSION"
    })
  })

  otelProvider.addLogRecordProcessor(new BatchLogRecordProcessor(otlpExporter, {
    maxExportBatchSize: 100,
    scheduledDelayMillis: 100,
  }));

  class OpenTelemetryTransport extends winston.Transport {
    log(info, callback) {
      try {
        const { level, message, ...meta } = info;
        const logger = otelProvider.getLogger('default');
        const serializedMeta = serializeMeta(meta);
        const logAttributes = {
          level: level || 'info',
          message: message || '',
          ...serializedMeta,
        };
        logger.emit({
          severityText: level,
          body: message,
          attributes: logAttributes
        });
      } catch (error) {
        console.error('Error sending log to OpenTelemetry:', error); 8
      }
      callback();
    }
  }


  function serializeMeta(meta) {
    return Object.entries(meta || {}).reduce((acc, [key, value]) => {
      if (typeof key === 'symbol') return acc;
      if (typeof value === 'object' && value !== null) {
        try {
          acc[key] = JSON.stringify(value);
        } catch (err) {
          acc[key] = String(value); 
        }
      } else {
        acc[key] = value;
      }

      return acc;
    }, {});
  }


  transports = [
    new winston.transports.Console({
      format: consoleFormat,
    }),
    new OpenTelemetryTransport(),
  ];

}
else {
  transports = [
    new winston.transports.Console({
      format: consoleFormat,
    })
  ];
}

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

const level = () => {
  const env = process.env.NODE_ENV || 'DEVELOPMENT';
  return env === 'DEVELOPMENT' ? 'debug' : 'info';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);


const logger = winston.createLogger({
  level: level(),
  levels,
  transports,
});

logger.requestContext = (req) => {
  return {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userId: req.session?.user?._id || 'not-authenticated',
  };
};

logger.errorWithContext = (message, error, req) => {
  const context = logger.requestContext(req);
  logger.error(message, {
    ...context,
    message: error.message,
    stack: error.stack,
    name: error.name,
  });
};

module.exports = logger;

