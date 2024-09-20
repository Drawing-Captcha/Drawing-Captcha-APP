async function addSyncMessage(shells, type) {
    if(shells instanceof NodeList || Array.isArray(shells)){
        shells.forEach(shell => {
            let stackedList = shell.querySelectorAll(".stacked-list1_list-wrapper > *")
            let wrapper = shell.querySelector(".stacked-list1_list-wrapper")
            if (stackedList.length < 1) {
                buildSyncMessage(wrapper, type)
            }
        })
    }
    else{
        let wrapper = shells.querySelector(".stacked-list1_list-wrapper")
        buildSyncMessage(wrapper, type)
        
    }

}

function buildSyncMessage(wrapper, type) {
    const syncWrapper = document.createElement("div");
    syncWrapper.classList.add("syncWrapper");

    syncWrapper.addEventListener("click", () => window.location.reload());
    syncWrapper.style.cursor = "pointer";

    const syncMessage = document.createElement("h3");
    syncMessage.innerHTML = `No ${type} in database, sync here.. 🤔🔄`;

    wrapper.appendChild(syncWrapper);
    syncWrapper.appendChild(syncMessage);

}
