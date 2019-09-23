import { evaluateAuthenticatedContext } from './middleware/authentication';
import { ensureBearerToken } from './middleware/authorization';
import { insertCorrelationId } from './middleware/requestId';
import { createLogger } from './utils/logger';

interface IOptions {
    appName: string;
    hostUrl: string;
    idGatewayUrl: string;
    idmClientId: string;
    logLevel: 'debug' | 'error' | 'fatal' | 'info' | 'trace' | 'warn';
    prettyPrintLogs?: boolean;
    useRawConsoleLogger?: boolean;
    exposeStack?: boolean;
};

export default (options: IOptions) => {
    const {
        appName,
        hostUrl,
        idGatewayUrl,
        idmClientId,
        logLevel,
        prettyPrintLogs = false,
        useRawConsoleLogger = false,
        exposeStack = false,
    } = options;

    return {
        config: {
            appName,
            hostUrl,
            logLevel,
            prettyPrintLogs,
            useRawConsoleLogger,
            exposeStack,
            idGatewayUrl,
            idmClientId,
        },
        middleware: {
            ensureBearerToken,
            evaluateAuthenticatedContext,
            insertCorrelationId,
        },
        util: {
            logger: createLogger({ appName, logLevel, prettyPrintLogs, useRawConsoleLogger }),
            createLogger,
        },
    };
};