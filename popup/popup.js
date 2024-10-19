/** @type {HTMLButtonElement|null}  */
const blockButton = document.querySelector("#block-button")
/** @type {HTMLButtonElement|null}  */
const resetButton = document.querySelector("#reset-button")
/** @type {HTMLUListElement|null}  */
const blockedContainer = document.querySelector("#blocked-container")
// 
async function main(){
    console.log("main is called");
    try{
        renderBlockedList()
    }catch(err){
        console.log(err);
    }
}
main()
// event listeners
blockButton?.addEventListener("click",async()=>{
    const tab = await getCurrentTab()
    addSiteToBlockedArray(tab,async ()=>{
        renderBlockedList()
    })
    // chrome.runtime.sendMessage({type:"add",tab:tab,value:"string"},(response)=>{
    //     console.log(response);
    // })
})

resetButton?.addEventListener("click",function(){
    removeAllBlockedSites(()=>{
        renderBlockedList()
    })
})
//


async function renderBlockedList(){
    if(!blockedContainer) return;
    const blockedStore = await getBlockedSites()
    console.log(blockedStore);
    const blocked = blockedStore.blocked || []
    let blockedList = blockedContainer.querySelector("#blocked-list")
    if(blockedList){
        blockedList.remove()
    }
    blockedList = document.createElement("ul")
    blockedList.classList.add("blocked-list")
    blockedList.id = "blocked-list"
    blockedContainer.appendChild(blockedList)
    for(let i = 0;i<blocked.length;i++){
        const item = blocked[i]
        const li = document.createElement("li")
        const img = document.createElement("img")
        const label = document.createElement("label")
        img.src = item.favicon
        label.innerText  = item.url
        li.appendChild(img)
        li.appendChild(label)
        blockedList.appendChild(li)
        void document.body.offsetHeight;
    }
}

function resizeViewBox(){
    const root = document.documentElement
    const width = root.scrollWidth 
    const height = root.offsetHeight 
    console.log(height);
    
    root.style.height = `${height-40}px`
}
function removeSiteListView(){
    const root = document.documentElement
    root.style.height = '170px'
}

/**
 * @param {chrome.tabs.Tab} tab 
 * @param {function} [callback] 
 */
async function addSiteToBlockedArray(tab,callback){
    try{
        const blockedSites = await getBlockedSites()
        const curr = blockedSites.blocked || []
        const origin = new URL( tab.url ||"").origin
        const index = findUrlIndex(curr,origin)
        if(index === -1){
            const item = {
                url:origin,
                favicon:tab.favIconUrl
            }
            storeBlockedSites([...curr,item])
        }
        callback &&callback()
        console.log(tab);
        console.log(blockedSites);
    }catch(err){
        console.log(err);
    }
}

/**
 * @param {function} [callback] 
 */
async function removeAllBlockedSites(callback){
    try{
        const {blocked} = await getBlockedSites()
        if(blocked && blocked.length > 0){
            await chrome.storage.local.remove("blocked")
            callback && callback()
            removeSiteListView() 
        }
    }catch(err){
        console.log(err);
    }
}


// utility functions
async function getCurrentTab(){
    const [tab] = await chrome.tabs.query({active:true,currentWindow:true})
    return tab;
}

async function getBlockedSites(){
    const blocked =await chrome.storage.local.get(null)
    return blocked
}

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

/**
 * @param {Blocked[]} data 
 */
async function storeBlockedSites(data){
    await chrome.storage.local.set({blocked:data})
}
