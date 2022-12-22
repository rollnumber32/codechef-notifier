chrome.webRequest.onBeforeSendHeaders.addListener(
    (details) => {
        console.log(details);
    },
    { urls: ["<all_urls>"] }
);
