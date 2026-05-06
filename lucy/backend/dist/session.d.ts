export declare function connectRedis(): Promise<void>;
export declare function storeSession(sessionId: string, email: string): Promise<void>;
export declare function getEmailFromSession(sessionId: string): Promise<string | null>;
