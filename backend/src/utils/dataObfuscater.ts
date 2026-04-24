import cloneDeep from 'lodash/cloneDeep'

export function dataObfuscater(input: any, applyToAll: boolean | undefined) {
    try {
        if (applyToAll) {
            return '****'
        }

        if (typeof input === 'object' && input !== null) {
            // Handle Error objects specially since cloneDeep doesn't work well with them
            if (input instanceof Error) {
                input = {
                    name: input.name,
                    message: input.message,
                    stack: input.stack
                        ? input.stack.split('\n').slice(0, 15).join('\n')
                        : undefined,
                    ...(input as any) // Include any additional properties
                };
            }

            // deep inspect object and look for sensitive properties and replace their values with '****'
            const inputClone = cloneDeep(input)

            function deepInspect(obj, visited = new WeakSet()) {
                // Check if this object has already been visited (circular reference detection)
                if (visited.has(obj)) {
                    return; // Skip already visited objects to prevent infinite recursion
                }
                visited.add(obj);

                // Use Object.keys() to iterate only over own properties
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        deepInspect(obj[key], visited)
                    } else if (typeof obj[key] === 'string' && shouldMaskProperty(key)) {
                        obj[key] = '****'
                    }
                });
            }

            function shouldMaskProperty(key: string): boolean {
                const sensitiveKeys = [
                    'pass', 'password', 'pwd',
                    'secret', 'secret_access_key',
                    'api_key', 'apikey', 'key',
                    'token', 'auth', 'authorization',
                    'certificate', 'cert', 'signature',
                    'cred', 'credentials'
                ];

                const lowerKey = key.toLowerCase();
                return sensitiveKeys.some(sensitiveKey => lowerKey.includes(sensitiveKey));
            }

            deepInspect(inputClone)

            return inputClone
        }

        return input
    } catch (error) {
        // If any error occurs during obfuscation, return a safe fallback to prevent breaking the application
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.warn('dataObfuscater: Error during data obfuscation, returning safe fallback:', errorMessage);
        return { data: '****', error: 'obfuscation_failed' };
    }
}
