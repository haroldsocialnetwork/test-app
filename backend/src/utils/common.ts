import debug from 'debug';
import { dataObfuscater } from './dataObfuscater'

interface LoggerWrapper {
    (...args: any[]): void;
    enabled: boolean;
    namespace: string;
}

export function GetDebugLoggers(app_name: string, module_name: string): {
    logDebug: LoggerWrapper;
    logInfo: LoggerWrapper;
    logError: LoggerWrapper;
} {
    const logDebug = debug(`${app_name}:DEB/${module_name}`);
    const logInfo = debug(`${app_name}:INF/${module_name}`);
    const logError = debug(`${app_name}:ERR/${module_name}`);

    logError.enabled = true;

    const createLoggerWrapper = (logger: debug.Debugger): LoggerWrapper => {
        const wrapper = (...args: any[]) => {
            if (!logger.enabled) {
                return;
            }
            const processedArgs = args.map(arg => {
                if (typeof arg === 'object' && arg !== null) {
                    return dataObfuscater(arg, false);
                }
                return arg;
            });
            (logger as (...a: any[]) => void)(...processedArgs);
        };

        // Expose enabled property and namespace for compatibility
        Object.defineProperty(wrapper, 'enabled', {
            get: () => logger.enabled,
            set: (value) => { logger.enabled = value; }
        });

        Object.defineProperty(wrapper, 'namespace', {
            get: () => logger.namespace
        });

        return wrapper as LoggerWrapper;
    };

    return {
        logDebug: createLoggerWrapper(logDebug),
        logInfo: createLoggerWrapper(logInfo),
        logError: createLoggerWrapper(logError)
    }
}
