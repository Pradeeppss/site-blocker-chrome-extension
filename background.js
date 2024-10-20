/**
 * @typedef {{
 *  url:string,
 *  favicon:string,
 *  redirectUrl?:string}} Blocked
 * 
 * @typedef {string[]} KeyWords 
 * @typedef {"keyword"|"url"} BlockTypes
*/

const redirectUrl = "chrome://newtab/"

// chrome.tabs.onActivated.addListener((tab) => {
// })

chrome.tabs.onUpdated.addListener((tab) => {
    async function getTabDetails() {
        try {
            const currTab = await getCurrentTab()
            if (!currTab?.url) return;
            const origin = new URL(currTab.url || "").origin
            const { blocked, isBlocked } = await isSiteBlocked(origin)
            if (!isBlocked) return;
            const redirect = blocked?.redirectUrl || redirectUrl
            chrome.tabs.update({ url: redirect })
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
 * @param {string} origin 
 * @returns {Promise<{isBlocked:boolean,blocked?:Blocked}>}
 */
async function isSiteBlocked(origin) {
    
    const retVal = { isBlocked: false }
    const { blocked, keywords } = await getBlockedSites()
    const index = findMatchingUrlIndex(blocked, origin)
    if (index !== -1) {
        return  { isBlocked: true, blocked: blocked[index] }
    }
    if(isMatchingKeys(keywords, origin)){
        retVal.isBlocked = true
        return retVal;
    }
    return retVal
}

/**
 * @param {Blocked[]} source 
 * @param {string} value 
 * @returns {number}
 */
function findMatchingUrlIndex(source = [], value) {
    for (let i = 0; i < source.length; i++) {
        const item = source[i]
        if (item.url === value) {
            return i
        }
    }
    return -1
}
/**
 * @param {KeyWords} keys 
 * @param {string} value 
 * @returns {boolean}
 */
function isMatchingKeys(keys = [],value){
    for (let i = 0;i<keys.length;i++){
        const key = keys[i]
        if(value.includes(key)){
            return true
        }
    }
    return false
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

