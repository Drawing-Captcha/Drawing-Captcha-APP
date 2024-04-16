document.addEventListener("DOMContentLoaded", initialize);
let tmpPool = [];
let pool;
var isDelete;

async function initialize() {
    await getDeletedBin();
}

async function getDeletedBin() {
    try {
        const response = await fetch("/deletedArchive/fetch", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const deletedBin = data.deletedBin;

            const wrapper = document.querySelector(".stacked-list1_list-wrapper");

            if (deletedBin.length != 0) {

                deletedBin.forEach(elementData => {
                    const item = document.createElement("div");
                    item.classList.add("stacked-list1_item");

                    const avatar = document.createElement("div");
                    avatar.classList.add("stacked-list1_avatar");

                    const avatarImageWrapper = document.createElement("div");
                    avatarImageWrapper.classList.add("stacked-list1_avatar-image-wrapper");

                    const img = document.createElement("img");
                    img.src = elementData.URL;
                    img.loading = "lazy";
                    img.alt = elementData.Name;
                    img.classList.add("stacked-list1_avatar-image");
                    avatarImageWrapper.appendChild(img);

                    const maxwidthLarge = document.createElement("div");
                    maxwidthLarge.classList.add("max-width-large");

                    const itemName = document.createElement("div");
                    itemName.classList.add("text-weight-semibold");
                    itemName.textContent = elementData.Name;
                    maxwidthLarge.appendChild(itemName);

                    avatar.appendChild(avatarImageWrapper);
                    avatar.appendChild(maxwidthLarge);

                    const contentRight = document.createElement("div");
                    contentRight.classList.add("stacked-list1_content-right");

                    const dropdownComponent = document.createElement("div");
                    dropdownComponent.classList.add("dropdown1_component", "w-dropdown");
                    dropdownComponent.setAttribute("data-hover", "false");
                    dropdownComponent.setAttribute("data-delay", "200");
                    dropdownComponent.setAttribute("data-w-id", "e27fbb5a-82f5-b6dd-7c36-aa1b5a28c88d");

                    const droppDownToggle = document.createElement("div");
                    droppDownToggle.classList.add("dropdown1_toggle", "w-dropdown-toggle");

                    const deleteButton = document.createElement("button");
                    deleteButton.classList.add("iconButton", "is-icon-only");
                    deleteButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    deleteButton.addEventListener("click", () => deleteComponent(elementData));

                    const returnButton = document.createElement("button");
                    returnButton.classList.add("iconButton", "is-icon-only");
                    returnButton.innerHTML = '<svg fill="none" height="24" viewBox="0 0 48 48" width="24" xmlns="http://www.w3.org/2000/svg"><path d="m0 0h48v48h-48z" fill="#fff" fill-opacity=".01"/><g stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="4"><path d="m12.3638 8-6.36399 6.364 6.36399 6.3639"/><path d="m6 14.364h22.6722c6.8848 0 12.54 5.4388 12.8083 12.3184.2836 7.2696-5.5331 13.3176-12.8083 13.3176h-16.6722"/></g></svg>';
                    returnButton.addEventListener("click", () => getBack(elementData));

                    droppDownToggle.appendChild(deleteButton);
                    droppDownToggle.appendChild(returnButton);
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapper.appendChild(item);
                });
            }
            else {
                const syncWrapper = document.createElement("div")
                syncWrapper.classList.add("syncWrapper")

                syncWrapper.addEventListener("click", () => window.location.reload())
                syncWrapper.style.cursor = "pointer"


                const syncMessage = document.createElement("h3")
                syncMessage.innerHTML = "No items in pool currently, sync here.. 🤔🔄"

                wrapper.appendChild(syncWrapper)
                syncWrapper.appendChild(syncMessage)
                syncWrapper.appendChild(syncButton)

            }


        } else {
            throw new Error('Error server while trying to request the server');
        }
    } catch (error) {
        console.log(error)
    }
}


function deleteComponent(e) {
    pool = e
    tmpPool.push(pool)
    isDelete = true
    pushToServer()
}

function getBack(e) {
    pool = e
    tmpPool.push(pool)
    isDelete = false
    pushToServer()

}

function pushToServer() {
    fetch("/dashboard/deletedArchive", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmpPool, isDelete })
    })

        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data.isGood) {
                alert("Changes successfully implemented on CRUD (Deleted Archive) system")
                window.location.reload()
            }
            else {
                alert("An error occurred, check the data processing of the CRUD system in the backend")
                window.location.reload()

            }

        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('An error occurred. Please try again later.');
        });


}