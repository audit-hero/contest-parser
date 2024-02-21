import { Page } from "playwright";
export type ScrapeResult = {
    content: string;
    title: string;
    url: string;
};
export declare const closeBrowser: () => void;
export declare let scrape: (url: string, loadingPhrases?: string[], wait?: number) => Promise<ScrapeResult>;
export declare function waitForPageToLoad(page: Page, loadingPhrases: string[], wait?: number): Promise<{
    content: string;
    title: string;
    startTime: number;
}>;
