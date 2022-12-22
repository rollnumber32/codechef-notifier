let id;
chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        const url = new URL(details.url);
        id = url.searchParams.get("solution_id");
        console.log(id);
    },
    { urls: ["*://*.codechef.com/*"] }
);
