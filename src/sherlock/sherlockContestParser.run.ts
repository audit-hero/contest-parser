import Logger from "js-logger";
import {  parseActiveSherlockContests } from "./sherlockContestParser.js";

let active = await parseActiveSherlockContests([])

Logger.info(`parsed ${active.length} contests`)

