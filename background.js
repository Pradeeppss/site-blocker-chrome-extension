/**
 * @typedef {{
 *  url:string,
 *  favicon:string,
 *  redirectUrl?:string}} Blocked
 */

const redirectUrl = "chrome://newtab/"

chrome.tabs.onActivated.addListener((tab)=>{
    async function getTabDetails(){
        const currTab = await getCurrentTab()
    }
    getTabDetails()
})

chrome.tabs.onUpdated.addListener((tab)=>{
    console.log("updated");
    // chrome.tabs.update({url:reditectUrl})
    // async function getTabDetails(){
    //     const currTab = await getCurrentTab()
    //     console.log(currTab);
    // }
    // getTabDetails()
})

chrome.runtime.onMessage.addListener(async (message,_,callback)=>{
    console.log(message);
    const blockedSites = await getBlockedSites()
    if(message.type === "add"){
    
    }
    callback(message)
    return true
})


/**
 * @param {Blocked[]} source 
 * @param {string} value 
 */
function findUrlIndex(source,value){
    for(let i = 0;i<source.length;i++){
        const item = source[i]
        if(item.url === value){
            return i
        }
    }
    return -1
}

async function getBlockedSites(){
    const blocked =await chrome.storage.local.get(null)
    return blocked
}

/**
 * @param {Blocked[]} data 
 */
async function storeBlockedSites(data){
    await chrome.storage.local.set({blocked:data})
}

// 
async function getCurrentTab(){
    const [tab] = await chrome.tabs.query({active:false,lastFocusedWindow:true})
    console.log(tab);
    return tab;
}

