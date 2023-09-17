import { ContestModule } from "ah-shared";
import { Project } from "./types.js";
export declare const getModules: (contest: Project, name: string) => Promise<ContestModule[]>;
