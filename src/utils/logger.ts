import pino from 'pino';

interface IAvoidLog {
    /** We do this because Pino does not have a log method. See why at: https://github.com/pinojs/pino/issues/460#issuecomment-407718003 */
    log: (thisIsNotARealFunctionSoDoNotUseIt: never) => void;
}

export type ILogger = pino.Logger & IAvoidLog;

const possibleLevels: pino.Level[] = ['debug', 'error', 'fatal', 'info', 'trace', 'warn'];

function isPinoLogLevel(test: string): test is pino.Level {
    return (possibleLevels as string[]).includes(test);
}

function returnLogLevelOrThrow(test: string | unknown): pino.Level {
    if (typeof test !== 'string') {
        throw new Error('Expected the log level to be a string');
    }
    if (!isPinoLogLevel(test)) {
        throw new Error(`This is not a valid log level: ${test}. Possible options are: ${possibleLevels.join(', ')}`);
    }
    return test;
}

class MockConsoleLogger implements pino.Logger {
    // tslint:disable-next-line: no-any
    [key: string]: pino.LogFn | any;
    public readonly pino: string;
    public LOG_VERSION: number;
    public levels: pino.LevelMapping;
    public level: string;
    public useLevelLabels: boolean;
    public customLevels: { [key: string]: number };
    public useOnlyCustomLevels: boolean;
    public levelVal: number;
    public addLevel(): boolean {
        throw new Error('Method not implemented.');
    }
    constructor() {
        this.pino = '';
        this.LOG_VERSION = 1;
        this.levels = {
            values: { fatal: 1, error: 2, warn: 3, info: 4, debug: 5, trace: 6, },
            labels: { 1: 'fatal', 2: 'error', 3: 'warn', 4: 'info', 5: 'debug', 6: 'trace', }
        };
        this.level = 'info';
        this.useLevelLabels = false;
        this.customLevels = {};
        this.useOnlyCustomLevels = false;
        // tslint:disable-next-line: no-magic-numbers
        this.levelVal = 7;
    }
    // tslint:disable
    on(): this {
        throw new Error('Method not implemented.');
    }
    addListener(): this {
        throw new Error('Method not implemented.');
    }
    once(): this {
        throw new Error('Method not implemented.');
    }
    prependListener(): this {
        throw new Error('Method not implemented.');
    }
    prependOnceListener(): this {
        throw new Error('Method not implemented.');
    }
    removeListener(): this {
        throw new Error('Method not implemented.');
    }
    child(): pino.Logger {
        throw new Error('Method not implemented.');
    }
    fatal = console.error;
    error = console.error;
    warn = console.warn;
    info = console.info;
    debug = console.debug;
    trace = console.trace;
    flush(): void {
        return;
    }
    isLevelEnabled(): boolean {
        throw new Error('Method not implemented.');
    }
    off(): this {
        throw new Error('Method not implemented.');
    }
    removeAllListeners(): this {
        throw new Error('Method not implemented.');
    }
    setMaxListeners(): this {
        throw new Error('Method not implemented.');
    }
    getMaxListeners(): number {
        throw new Error('Method not implemented.');
    }
    listeners(): Function[] {
        throw new Error('Method not implemented.');
    }
    rawListeners(): Function[] {
        throw new Error('Method not implemented.');
    }
    emit(): boolean {
        throw new Error('Method not implemented.');
    }
    listenerCount(): number {
        throw new Error('Method not implemented.');
    }
    eventNames(): (string | symbol)[] {
        throw new Error('Method not implemented.');
    }
    // tslint:enable
}

const getPinoInstance = (opts: IPinoOptions) =>
    opts.useRawConsoleLogger === true
        ? new MockConsoleLogger()
        : pino({
            level: opts.logLevel,
            name: opts.appName,
            prettyPrint: opts.prettyPrintOptions || false,
            serializers: {
                err: pino.stdSerializers.err,
                req: pino.stdSerializers.req,
                res: pino.stdSerializers.res,
            },
        });

function doNotUseLogOrYouWillBeFired(pleaseDontUseLog: never) {
    throw new Error(
        `Pino does not have a log method. See why at: https://github.com/pinojs/pino/issues/460#issuecomment-407718003 Note: you sent in ${pleaseDontUseLog}`,
    );
}

interface ILoggerOptions {
    appName: string;
    logLevel: string;
    prettyPrintLogs?: string | boolean | null;
    useRawConsoleLogger?: string | boolean | null;
}

interface IPinoOptions {
    appName: string;
    logLevel: string;
    prettyPrintOptions?: pino.LoggerOptions['prettyPrint'];
    useRawConsoleLogger?: string | boolean | null;
}

export const logger = (opts: ILoggerOptions) => {
    const { appName, useRawConsoleLogger } = opts;
    const logLevel = returnLogLevelOrThrow(opts.logLevel);
    const prettyPrintOptions = (opts.prettyPrintLogs as unknown) as pino.LoggerOptions['prettyPrint'];
    const pinoInstance = getPinoInstance({
        appName,
        logLevel,
        prettyPrintOptions,
        useRawConsoleLogger
    }) as ILogger;

    pinoInstance.log = doNotUseLogOrYouWillBeFired;

    return pinoInstance;
};