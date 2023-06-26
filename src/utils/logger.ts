export class Logger {
  prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  log(message: string, ...args: any[]) {
    console.log(`[${this.prefix}] ${message}`, ...args)
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.prefix}] ${message}`, ...args)
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.prefix}] ${message}`, ...args)
  }
}
