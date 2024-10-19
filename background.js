/**
 * @typedef {{
 *  url:string,
 *  favicon:string,
 *  redirectUrl?:string}} Blocked
 */

const redirectUrl = "chrome://newtab/"

chrome.tabs.onActivated.addListener((tab) => {
    async function getTabDetails() {
        const currTab = await getCurrentTab()
    }
    getTabDetails()
})

chrome.tabs.onUpdated.addListener((tab) => {
    async function getTabDetails() {
        try {
            const currTab = await getCurrentTab()
            if (!currTab?.url) return;
            const origin = new URL(currTab.url || "").origin
            const {blocked} = await getBlockedSites()
            if (!blocked) return;
            const index = findUrlIndex(blocked,origin)
            if(index !== -1){
                const redirect = blocked[index]?.redirectUrl || redirectUrl 
                chrome.tabs.update({url:redirect})
            }
        } catch (err) {
            console.log(err);
        }
    }
    getTabDetails()
})

// chrome.runtime.onMessage.addListener(async (message, _, callback) => {
//     console.log(message);
//     const blockedSites = await getBlockedSites()
//     if (message.type === "add") {
//     }
//     callback(message)
//     return true
// })


// utility functions

/**
 * @param {Blocked[]} source 
 * @param {string} value 
 */
function findUrlIndex(source, value) {
    for (let i = 0; i < source.length; i++) {
        const item = source[i]
        if (item.url === value) {
            return i
        }
    }
    return -1
}

async function getBlockedSites() {
    const store = await chrome.storage.local.get(null)
    return store
}

/**
 * @param {Blocked[]} data 
 */
async function storeBlockedSites(data) {
    await chrome.storage.local.set({ blocked: data })
}

// 
async function getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, lastFocusedWindow: true })
    return tab;
}

