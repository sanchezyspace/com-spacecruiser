export class Logger {
  prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  log(message: string, ...args: any[]) {
    console.log(`[${this.prefix}] ${message}`, ...args)
  }
}
