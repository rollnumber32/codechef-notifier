//Initializing storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ submissions: [] });
});

//Global variables
var x_csrf_token = null;

//Listing for new submissions
chrome.webRequest.onBeforeSendHeaders.addListener(
    async (details) => {
        const url = new URL(details.url);
        const solution_id = url.searchParams.get("solution_id");

        const data = await chrome.storage.sync.get(["submissions"]);
        const submissions = data.submissions;

        //insert if solution_id not present in storage
        if (solution_id && !isPresent(solution_id, submissions)) {
            if (!x_csrf_token) x_csrf_token = getToken(details.requestHeaders);
            let submission = {
                title: getTitle(details.requestHeaders),
                solution_id: solution_id,
            };
            submissions.push(submission);
            chrome.storage.sync.set({ submissions: submissions });
        }
    },
    { urls: ["*://www.codechef.com/*"] },
    ["requestHeaders", "extraHeaders"]
);

//Checking if submission already present into storage
function isPresent(solution_id, submissions) {
    let res = false;
    submissions.forEach((submission) => {
        switch (submission.solution_id) {
            case solution_id:
                res = true;
                break;
        }
    });
    return res;
}

//Extracting x-csrf-token value
function getToken(headers) {
    let token = null;
    headers.forEach((header) => {
        switch (header.name) {
            case "x-csrf-token":
                token = header.value;
                break;
        }
    });
    return token;
}

//Extracting title of the problem
function getTitle(headers) {
    let url = null;
    headers.forEach((header) => {
        switch (header.name) {
            case "Referer":
                url = header.value;
                break;
        }
    });
    return url.substring(url.lastIndexOf("/") + 1);
}
