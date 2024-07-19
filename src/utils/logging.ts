export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

function levelToString(level: LogLevel): string {
  switch (level) {
    case LogLevel.DEBUG:
      return 'DEBUG';
    case LogLevel.INFO:
      return 'INFO';
    case LogLevel.WARN:
      return 'WARN';
    case LogLevel.ERROR:
      return 'ERROR';
    default:
      throw new Error('Invalid log level');
  }
}

// LogFields is a collection of fields to be appended to a log line.
type LogFields = { [key: string]: any };

// Converts the provided LogFields into a string that can
// be appended to a log line.
function fieldsToString(fields: LogFields): string {
  var str = '';
  for (var key in fields) {
    var value = fields[key];

    str += ` ${key}=${value}`;
  }
  return str;
}

export class Logger {
  private level: LogLevel;
  private name: string;
  private fields: LogFields;

  constructor(name: string, level: LogLevel, fields?: LogFields) {
    this.level = level;
    this.name = name;

    if (fields) {
      this.fields = fields
    } else {
      this.fields = {}
    }
  }

  private log(level: LogLevel, message: string, fields?: LogFields): void {
    if (this.level > level)
      return

    const mergedFields = { ...this.fields, ...fields };

    const fieldsString = fieldsToString(mergedFields);

    console.log(`[${levelToString(level)}] ${this.name}: ${message} | ${fieldsString}`)
  }

  // Creates a new child logger with the same level as this one.
  // The new name for the logger will be "$parent.$child", and the
  // provided fields will be merged with the existing fields on this
  // logger.
  child(name: string, fields?: LogFields): Logger {
    return new Logger(`${this.name}.${name}`, this.level, { ...this.fields, ...fields });
  }

  // Logs a new message at DEBUG level, if the current level is LogLeve.DEBUG or higher.
  debug(message: string, fields?: LogFields): void {
    this.log(LogLevel.DEBUG, message, fields);
  }

  // Logs a new message at INFO level, if the current level is LogLevel.INFO or higher.
  info(message: string, fields?: LogFields): void {
    this.log(LogLevel.INFO, message, fields);
  }

  // Logs a new message at WARN level, if the current level is LogLevel.WARN or higher.
  warn(message: string, fields?: LogFields): void {
    this.log(LogLevel.WARN, message, fields);
  }

  // Logs a new message at ERROR level, if the current level is LogLeve.ERROR or higher.
  error(message: string, fields?: LogFields): void {
    this.log(LogLevel.ERROR, message, fields);
  }
}
