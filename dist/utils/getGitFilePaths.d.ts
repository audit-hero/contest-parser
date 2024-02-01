export declare let cryptoIncludeGlobs: string[];
export type Input = {
    url: string;
    includeGlobs: string[];
    ignoreGlobs?: string[];
};
export declare let cryptoIgnoreGlobs: string[];
export declare const getGitFilePaths: ({ url, includeGlobs, ignoreGlobs, }: Input) => Promise<string[]>;
