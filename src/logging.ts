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

type LogFields = { [key: string]: any };

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

  child(name: string, fields?: LogFields): Logger {
    return new Logger(`${this.name}.${name}`, this.level, { ...this.fields, ...fields });
  }

  debug(message: string, fields?: LogFields): void {
    this.log(LogLevel.DEBUG, message, fields);
  }

  info(message: string, fields?: LogFields): void {
    this.log(LogLevel.INFO, message, fields);
  }

  warn(message: string, fields?: LogFields): void {
    this.log(LogLevel.WARN, message, fields);
  }

  error(message: string, fields?: LogFields): void {
    this.log(LogLevel.ERROR, message, fields);
  }
}
