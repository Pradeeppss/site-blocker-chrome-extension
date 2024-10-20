/** @type {HTMLButtonElement|null}  */
const blockButton = document.querySelector("#block-button")
/** @type {HTMLButtonElement|null}  */
const resetButton = document.querySelector("#reset-button")
/** @type {HTMLUListElement|null}  */
const blockedContainer = document.querySelector("#blocked-container")
/** @type {HTMLButtonElement|null} */
const keyWordBlockButton = document.querySelector("#block-img-button")
/** @type {HTMLInputElement|null} */
const keyWordInput = document.querySelector("#block-keyword-input")
// 
async function main(){
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
    addSiteToBlockedArray(tab,()=>{
        renderBlockedList()
    })
    // chrome.runtime.sendMessage({type:"add",tab:tab,value:"string"},(response)=>{
    //     console.log(response);
    // })
})
keyWordBlockButton?.addEventListener("click",(ev)=>{
    ev.preventDefault()
    const key = keyWordInput?.value || ""
    console.log(key);
    
    addKeywordToBlockedKeywords(key,()=>{
        renderBlockedList()
    })
})

resetButton?.addEventListener("click",function(){
    removeAllBlockedKeywords()
    removeAllBlockedSites(()=>{
        renderBlockedList()
    })
})
//


async function renderBlockedList(){
    if(!blockedContainer) return;
    const blockedStore = await getBlockedSites()
    const blocked = blockedStore.blocked || []
    const Blockedkeywords = blockedStore.keywords || []
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
        const button = document.createElement("button")
        img.src = item.favicon
        label.innerText  = item.url
        button.classList.add('fa-regular','fa-trash-can')
        button.addEventListener("click",()=>{
            removeFromBlockedList("url",blocked,Blockedkeywords,i,()=>{
                resizeViewBox()
            })
        })
        li.appendChild(img)
        li.appendChild(label)
        li.appendChild(button)
        blockedList.appendChild(li)
        void document.body.offsetHeight;
    }
}

function resizeViewBox(){
    window.location.href = "popup.html"
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
        if(!validateOrigin(origin,curr))return;
        const item = {
            url:origin,
            favicon:tab.favIconUrl||"../assets/favicon.webp"
        }
        storeBlockedSites([...curr,item])
        callback && callback()
    }catch(err){
        console.log(err);
    }
}
/**
 * @param {string} key
 * @param {function} [callback] 
 */
async function addKeywordToBlockedKeywords(key,callback){
    try{
        const blockedSites = await getBlockedSites()
        const curr = blockedSites.keywords || []
        if(!validateKeyWord(key,curr))return;
        console.log(key);
        
        storeBlockedKeywords([...curr,key])
        callback && callback()
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
            resizeViewBox()
        }
    }catch(err){
        console.log(err);
    }
}
async function removeAllBlockedKeywords(){
    try{
        const {keywords} = await getBlockedSites()
        if(keywords && keywords.length > 0){
            await chrome.storage.local.remove("keywords")
            // callback && callback()
            resizeViewBox()
        }
    }catch(err){
        console.log(err);
    }
}
/**
 * @param {BlockTypes} type 
 * @param {Blocked[]} blockedList 
 * @param {KeyWords} keywords
 * @param {number} index 
 * @param {function} [callBack] 
 */
function removeFromBlockedList(type,blockedList,keywords,index,callBack){
    if(type === "url"){
        blockedList.splice(index,1)
        storeBlockedSites(blockedList)
    }else if(type === "keyword"){
        keywords.splice(index,1)
        storeBlockedKeywords(keywords)
    }
    callBack && callBack()
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
/**
 * @param {KeyWords} data 
 */
async function storeBlockedKeywords(data){
    await chrome.storage.local.set({keywords:data})
}

/**
 * 
 * @param {string} origin 
 * @param {Blocked[]} curr 
 * @return {boolean}
 */
function validateOrigin(origin,curr){
    // chrome tabs are not blockable
    if(origin.startsWith("chrome")){
        return false
    }
    // if site is already added
    const index = findUrlIndex(curr,origin)
    if(index !== -1){
        return false;
    }
    return true;
}
/**
 * 
 * @param {string} key 
 * @param {KeyWords} curr 
 * @returns {boolean}
 */
function validateKeyWord(key,curr){
    if(!key) return false;
    const reserved = ["chrome","tab","newTab","extensions"]
    if(reserved.includes(key)){
        return false
    }
    if(curr.includes(key)){
        return false
    }
    return true;
}