import { Project, VaultElement } from "./types.js";
export declare let hats_urls: string[];
export declare const getActiveContests: () => Promise<Project[]>;
export declare const getAllProjects: () => Promise<VaultElement[]>;
export declare const filterProjectActiveOrInFuture: (projets: Project[]) => Project[];
export declare const getProject: (descriptionHash: string, id: string) => Promise<Project>;
