//Initializing storage
chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.set({ submissions: [] });
});

//Listening for new submissions
chrome.webRequest.onBeforeSendHeaders.addListener(
    async (details) => {
        const url = new URL(details.url);
        const solution_id = url.searchParams.get("solution_id");

        const data = await chrome.storage.sync.get(["submissions"]);
        const submissions = data.submissions;

        //insert if solution_id not present in storage
        if (solution_id && !isPresent(solution_id, submissions)) {
            let submission = {
                title: getTitle(details.requestHeaders),
                solution_id: solution_id,
            };
            submissions.push(submission);
            chrome.storage.sync.set({ submissions: submissions });

            fetchResults();
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

//Fetching results
async function fetchResults() {
    const data = await chrome.storage.sync.get(["submissions"]);
    const submissions = data.submissions;

    if (submissions.length) {
        const res = [];

        submissions.forEach((submission) => {
            res.push(
                getData(
                    `https://www.codechef.com/api/ide/submit?solution_id=${submission.solution_id}`
                )
            );
        });

        Promise.all(res).then((res) => {
            res.forEach((r) => {
                console.log(r.result_code);
                if (r.result_code != "wait") {
                    chrome.storage.sync.set({
                        submissions: updatedSubmissions(r.upid, submissions),
                    });
                }
            });
            if (submissions.length) {
                setTimeout(fetchResults, 1000);
            }
        });
    }
}

//Fething individual response from api
function getData(url) {
    return new Promise((resolve, reject) => {
        fetch(url)
            .then((res) => res.json())
            .then((data) => resolve(data));
    });
}

//Updating submissions - Removing completed submission
function updatedSubmissions(solution_id, submissions) {
    var i = submissions.length;
    while (i--) {
        if (submissions[i]["solution_id"] === solution_id) {
            submissions.splice(i, 1);
        }
    }
    return submissions;
}
