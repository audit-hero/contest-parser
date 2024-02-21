export const contentTooShort = (doc, contentLength = 30, wordCount = 5, linesCount = 3) => {
    let docContentLength = doc.trim().length;
    let docWordCount = doc.split(" ").filter(it => it.length > 4).length;
    let docLinesCount = doc.split("\n").length;
    let filter = docContentLength < contentLength || docWordCount < wordCount || docLinesCount < linesCount;
    return filter;
};
export const isNotFoundPage = (doc, title) => {
    let titleNotFound = title?.includes("404") || title?.toLowerCase().includes("not found");
    if (titleNotFound)
        return true;
    let beginning = doc.slice(0, 100).toLowerCase();
    let bodyNotFound = beginning.includes("404")
        || beginning.includes("not found")
        || beginning.includes("nothing here")
        || doc.length < 100;
    if (bodyNotFound)
        return true;
    return false;
};
export const loading = (doc, loadingPhrases) => {
    return loadingPhrases.some(it => doc.toLowerCase().includes(it.toLowerCase()));
};
//# sourceMappingURL=verifyPage.js.map