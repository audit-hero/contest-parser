import { BrowserContext, Page } from "playwright-core";
export type Config = {
    wait: number;
    browser: () => Promise<BrowserContext>;
};
export declare let setPlaywrightConfig: (config_: Partial<Config>) => void;
export type ScrapeResult = {
    content: string;
    title: string;
    url: string;
};
export declare const closeBrowser: () => void;
export declare let newPage: () => Promise<Page>;
export declare let scrape: (url: string, loadingPhrases?: string[]) => Promise<ScrapeResult>;
export declare function waitForPageToLoad(page: Page, loadingPhrases: string[], wait?: number): Promise<{
    content: string;
    title: string;
    startTime: number;
}>;
