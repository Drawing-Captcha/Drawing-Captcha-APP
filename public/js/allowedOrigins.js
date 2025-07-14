const sectionHeader = document.querySelector(".section_page-header3")
const shellLayout = document.querySelector(".section_shell2-layout")
const changeDetailsDialog = document.getElementById('changeDetailsDialog');
const closeModalButton = changeDetailsDialog.querySelector(".close-button")
const toDoTitle = changeDetailsDialog.querySelector(".toDo")
const nameLabel = changeDetailsDialog.querySelector("#nameLabel")
const toDoText = changeDetailsDialog.querySelector(".toDoText")
const originInput = changeDetailsDialog.querySelector("#originInput")
const ApiKeyNameWrapper = changeDetailsDialog.querySelector("#apiKeyNameWrapper")
closeModalButton.addEventListener("click", hideDialog)
let originName;
async function getOrigins() {
    try {
        const response = await fetch("/dashboard/allowedOrigins", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            let Origins = data.allowedOrigins;
            let userRole = data.userRole;
            let appAdmin = data.appAdmin
            const shells = document.querySelectorAll(".stacked-list1_component.origins")
            let wrapperOrigins;
            if (Origins.length != 0) {
                Origins.forEach(elementData => {
                    if (elementData.companies.length != 0) {
                        shells.forEach(shell => {
                            if (shell.classList.contains("origins") && elementData.companies.includes(shell.getAttribute("companyId"))) {
                                wrapperOrigins = shell.querySelector(".stacked-list1_list-wrapper");

                            }
                        })
                    }
                    else {
                        if (appAdmin) {
                            wrapperOrigins = document.querySelector(".defaultAllowedOrigins ").querySelector(".stacked-list1_list-wrapper");
                        }

                    }
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

                    if (userRole != "read") {
                        droppDownToggle.appendChild(deleteButton);
                    }
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapperOrigins.appendChild(item);
                });

            }

            await addSyncMessage(shells, "origins")


        } else {
            throw new Error('Error server while trying to request the server');
        }
    } catch (error) {
        console.log(error)
    }
}

async function addOrigin() {
    toDoTitle.innerText = "Add new Origin 🔒"
    ApiKeyNameWrapper.style.display = "none"
    toDoText.innerHTML = "Important: if the domain has a seperate port please define it so you can access it properly."
    originInput.style = "border: 4px solid red";
    originInput.addEventListener("input", async (event) => {
        const regexResult = await proofRegexOriginsInput(event.target.value);
        if (regexResult.test) {
            event.target.style = "border: 4px solid #34C759;";
        } else {
            event.target.style = "border: 4px solid red";
        }
    })
    changeDetailsDialog.setAttribute("onsubmit", "submitOrigin(event); return false;");
    displayDialog()
}

function displayDialog() {
    changeDetailsDialog.showModal();
}
function hideDialog() {
    changeDetailsDialog.close();
}

async function submitOrigin(event) {
    let companiesList = document.querySelectorAll(".item")
    let selectedCompanies = []
    companiesList.forEach(company => {
        if (company.classList.contains("checked")) {
            selectedCompanies.push(company.getAttribute("obj-id"))
        }
    })
    if (selectedCompanies.length === 0) {
        alert("Please select one company to add the origin to.")
        return;
    }
    let origin = originInput.value;
    if (!origin) {
        alert("Please enter a valid origin.");
        return;
    }
    let regexResult = await proofRegexOrigins(origin);
    if (!regexResult.test) {
        return
    }
    fetch("/dashboard/allowedOrigins", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originName: regexResult.value, selectedCompanies })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data) {
                alert(data.message)
                location.reload();
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred, while trying to add Origin. Please try again later.');
        });
}
function addFrom() {
    itemPageWrapper.style.display = "flex";
    ItemWrapper.style.display = "flex";
    setTimeout(() => {
        itemPageWrapper.style.opacity = '1';
    }, 50);

}

function deleteOrigin(elementData) {
    let isDeleted = true;
    let origin = elementData.allowedOrigin;
    putOrigin(origin, isDeleted)
}

function putOrigin(origin, isDelete) {

    fetch("/dashboard/allowedOrigins", {
        method: "PUT",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ allowedOrigin: origin, isDelete })
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

function proofRegexOriginsInput(originName) {
    if (!originName) {
        return;
    }
    originName = originName.trim();

    if (originName.endsWith("/")) {
        originName = originName.slice(0, -1)
    }
    const expression = /^https?:\/\/((([a-z0-9]+)*\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}|(localhost|127\.0\.0\.1))(:[0-9]{1,5})?(\/.*)?$/i;
    const regex = new RegExp(expression);

    if (regex.test(originName)) {
        return { test: true, value: originName };
    } else {
        return { test: false, value: "" };
    }
}

