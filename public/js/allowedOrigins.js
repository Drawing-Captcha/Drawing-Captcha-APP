const wrapperOrigins = document.querySelector(".stacked-list1_list-wrapper.origins");
let originName;
async function getOrigins() {
    try {
        const response = await fetch("/allowedOrigins", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            Origins = data.allowedOrigins;

            if (Origins.length != 0) {

                Origins.forEach(elementData => {
                    const item = document.createElement("div");
                    item.classList.add("stacked-list1_item");

                    const avatar = document.createElement("div");
                    avatar.classList.add("stacked-list1_avatar");

                    const avatarImageWrapper = document.createElement("div");
                    avatarImageWrapper.classList.add("stacked-list1_avatar-image-wrapper");

                    const maxwidthLarge = document.createElement("div");
                    maxwidthLarge.classList.add("max-width-large");
                    maxwidthLarge.classList.add("apiWrapper");

                    const itemName = document.createElement("div");
                    itemName.classList.add("text-weight-semibold");
                    itemName.textContent = elementData.allowedOrigin;

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
                    deleteButton.innerHTML = '<svg width="24" color="#ffff" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    deleteButton.addEventListener("click", () => deleteOrigin(elementData));

                    droppDownToggle.appendChild(deleteButton);
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapperOrigins.appendChild(item);
                });

            }
            else {
                const syncWrapper = document.createElement("div")
                syncWrapper.classList.add("syncWrapper")

                syncWrapper.addEventListener("click", () => window.location.reload())
                syncWrapper.style.cursor = "pointer"


                const syncMessage = document.createElement("h3")
                syncMessage.innerHTML = "No allowed origins currently, sync here.. 🤔🔄"

                wrapperOrigins.appendChild(syncWrapper)
                syncWrapper.appendChild(syncMessage)

            }


        } else {
            throw new Error('Error server while trying to request the server');
        }
    } catch (error) {
        console.log(error)
    }

}


function addOrigin() {
    toDo.innerHTML = "Add new Origin 🔒 Important: if the domain has a seperate port please define it so you can access it properly.";
    createForm.setAttribute("onsubmit", "proofRegex(); return false;")
    addFrom();
}

function addFrom(){
    itemPageWrapper.style.display = "flex";
    ItemWrapper.style.display = "flex";
    setTimeout(() => {
        itemPageWrapper.style.opacity = '1';
    }, 50);
    
}

function proofRegex() {
    originName = formName.value;
    const expression = /^(https?:\/\/)?(((([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,})|(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})))(:\d{1,5})?((\/\w+)*\/)?(\w+\.[\w]{3,4})?(\?[\w%&=]*)?(#[\w]*)?$/;
    const regex = new RegExp(expression);

    if (regex.test(originName)) {
        submitOrigin();
    } else {
        alert("Regex error: please define your origin like this schema: https://yourdomain.com");
    }
}
function deleteOrigin(elementData){
    let isDeleted = true;
    let origin = elementData.allowedOrigin;
    putOrigin(origin, isDeleted)
}
function submitOrigin() {

    originName = formName.value;

    fetch("/allowedOrigins", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originName })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data.message) {
                alert(data.message)
                location.reload();
            }

        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
}

function putOrigin(origin, isDeleted) {

    fetch("/allowedOrigins", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowedOrigin: origin, isDeleted })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data.isOriginDeleted) {
                alert("Origin successfully deleted!")
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred, while trying to delete Origin. Please try again later.');
        });
}