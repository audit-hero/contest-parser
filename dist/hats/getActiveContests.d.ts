import { Project } from "./types";
export declare const getActiveContests: () => Promise<Project[]>;
export declare const getAllProjects: () => Promise<any[]>;
export declare const filterProjectActiveOrInFuture: (projets: Project[]) => Project[];
export declare const getProject: (descriptionHash: string, id: string) => Promise<Project>;
