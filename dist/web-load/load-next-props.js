import { newPage } from "./playwright-loader.js";
export let loadNextProps = async (url) => {
    let page = await newPage();
    await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 120000,
    });
    let nextData = await page.evaluate(async () => {
        let props = JSON.parse(document.querySelector("#__NEXT_DATA__")?.textContent ?? "");
        return props;
    });
    // this makes lambda fail with `Target page, context or browser has been closed`
    // page.close()
    return nextData.props.pageProps;
};
//# sourceMappingURL=load-next-props.js.map