export declare const getMdHeading: (line: string, headings: string[]) => string | undefined;
export declare const findDocUrl: (line: string, headings: string[]) => string[];
export declare const findTags: (lines: string[]) => string[];
export declare const getAllRepos: (org: string) => Promise<Repo[]>;
export declare const getRepoNameFromUrl: (url: string) => string;
import { Repo } from "ah-shared";
export declare let workingDir: () => string;
