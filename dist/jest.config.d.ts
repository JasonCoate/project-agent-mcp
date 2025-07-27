export let preset: string;
export let testEnvironment: string;
export let roots: string[];
export let testMatch: string[];
export let transform: {
    '^.+.ts$': string;
};
export let collectCoverageFrom: string[];
export let coverageDirectory: string;
export let coverageReporters: string[];
export namespace coverageThreshold {
    namespace global {
        let branches: number;
        let functions: number;
        let lines: number;
        let statements: number;
    }
}
export let setupFilesAfterEnv: string[];
export let testTimeout: number;
export let verbose: boolean;
export let forceExit: boolean;
export let detectOpenHandles: boolean;
