import { ContestModule } from "ah-shared";
import { SherlockContest } from "../types.js";
export declare const findModules: ({ lines, contest, name, repos, readmeObj, }: {
    lines: string[];
    contest: SherlockContest;
    name: string;
    repos: string[];
    readmeObj?: {
        baseUrl: string;
    } | undefined;
}) => {
    modules: ContestModule[];
    docUrls: string[];
};
