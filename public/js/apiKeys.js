const wrapper = document.querySelector(".stacked-list1_list-wrapper.apiKey");
const itemPageWrapper = document.querySelector(".itemPageWrapper");
const createForm = itemPageWrapper.querySelector("form");
const formName = createForm.querySelector("input");
const ItemWrapper = document.querySelector(".itemWrapper");
const toDo = ItemWrapper.querySelector("h3");
const selectBtn = document.querySelector(".select-btn")
const companyAccessSection = document.querySelectorAll("#companyAccess")

selectBtn.addEventListener("click", () => {
    selectBtn.classList.toggle("open");
});

function closeSelectBtn() {
    if (selectBtn.classList.contains("open")) {
        selectBtn.classList.remove("open");
    }
}

let Keys;
let apiName

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
    await buildOriginsShells();
    await getKeys();
    await getOrigins();
    await buildDropdown()

}

async function getKeys() {
    try {
        const response = await fetch("/dashboard/apiKey", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (response.ok) {
            const data = await response.json();
            let keys = data.apiKeys;
            let userRole = data.userRole
            let appAdmin = data.appAdmin
            const shells = document.querySelectorAll(".stacked-list1_component.apiKey")
            let wrapper
            if (keys.length > 0) {
                keys.forEach(elementData => {
                    if (elementData.companies.length != 0) {
                        shells.forEach(shell => {
                            if (shell.classList.contains("apiKey") && elementData.companies.includes(shell.getAttribute("companyId"))) {
                                wrapper = shell.querySelector(".stacked-list1_list-wrapper");

                            }
                        })
                    }
                    else {
                        if (appAdmin) {
                            wrapper = document.querySelector(".defaultApiKeys").querySelector(".stacked-list1_list-wrapper");
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
                    itemName.textContent = elementData.name;
                    const apiKey = document.createElement("p")
                    let tmpApi = elementData.apiKey
                    if (tmpApi.length > 7) {
                        var censoredText = tmpApi.substring(0, 7) + '*'.repeat(tmpApi.length - 7);
                        apiKey.textContent = censoredText;
                    }

                    maxwidthLarge.appendChild(itemName);
                    maxwidthLarge.appendChild(apiKey);

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

                    const copyButton = document.createElement("button");
                    copyButton.classList.add("iconButton", "is-icon-only");
                    copyButton.innerHTML = `<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                    <svg fill="#ffffff" height="800px" width="800px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" stroke="#ffffff">
                    
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <g id="SVGRepo_iconCarrier"> <g id="Text-files"> <path d="M53.9791489,9.1429005H50.010849c-0.0826988,0-0.1562004,0.0283995-0.2331009,0.0469999V5.0228 C49.7777481,2.253,47.4731483,0,44.6398468,0h-34.422596C7.3839517,0,5.0793519,2.253,5.0793519,5.0228v46.8432999 c0,2.7697983,2.3045998,5.0228004,5.1378999,5.0228004h6.0367002v2.2678986C16.253952,61.8274002,18.4702511,64,21.1954517,64 h32.783699c2.7252007,0,4.9414978-2.1725998,4.9414978-4.8432007V13.9861002 C58.9206467,11.3155003,56.7043495,9.1429005,53.9791489,9.1429005z M7.1110516,51.8661003V5.0228 c0-1.6487999,1.3938999-2.9909999,3.1062002-2.9909999h34.422596c1.7123032,0,3.1062012,1.3422,3.1062012,2.9909999v46.8432999 c0,1.6487999-1.393898,2.9911003-3.1062012,2.9911003h-34.422596C8.5049515,54.8572006,7.1110516,53.5149002,7.1110516,51.8661003z M56.8888474,59.1567993c0,1.550602-1.3055,2.8115005-2.9096985,2.8115005h-32.783699 c-1.6042004,0-2.9097996-1.2608986-2.9097996-2.8115005v-2.2678986h26.3541946 c2.8333015,0,5.1379013-2.2530022,5.1379013-5.0228004V11.1275997c0.0769005,0.0186005,0.1504021,0.0469999,0.2331009,0.0469999 h3.9682999c1.6041985,0,2.9096985,1.2609005,2.9096985,2.8115005V59.1567993z"/> <path d="M38.6031494,13.2063999H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0158005 c0,0.5615997,0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4542999,1.0158997-1.0158997 C39.6190491,13.6606998,39.16465,13.2063999,38.6031494,13.2063999z"/> <path d="M38.6031494,21.3334007H16.253952c-0.5615005,0-1.0159006,0.4542999-1.0159006,1.0157986 c0,0.5615005,0.4544001,1.0159016,1.0159006,1.0159016h22.3491974c0.5615005,0,1.0158997-0.454401,1.0158997-1.0159016 C39.6190491,21.7877007,39.16465,21.3334007,38.6031494,21.3334007z"/> <path d="M38.6031494,29.4603004H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h22.3491974c0.5615005,0,1.0158997-0.4543991,1.0158997-1.0158997 S39.16465,29.4603004,38.6031494,29.4603004z"/> <path d="M28.4444485,37.5872993H16.253952c-0.5615005,0-1.0159006,0.4543991-1.0159006,1.0158997 s0.4544001,1.0158997,1.0159006,1.0158997h12.1904964c0.5615025,0,1.0158005-0.4543991,1.0158005-1.0158997 S29.0059509,37.5872993,28.4444485,37.5872993z"/> </g> </g>
                    
                    </svg>`;
                    copyButton.addEventListener("click", () => copyApiKey(elementData));

                    const deleteButton = document.createElement("button");
                    deleteButton.classList.add("iconButton", "is-icon-only");
                    deleteButton.innerHTML = '<svg width="24" color="#ffff" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    deleteButton.addEventListener("click", () => deleteApiKey(elementData));

                    droppDownToggle.appendChild(copyButton);
                    if (userRole != "read") {
                        droppDownToggle.appendChild(deleteButton);
                    }
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapper.appendChild(item);
                });

            }

            await addSyncMessage(shells, "apiKeys")

        } else {
            throw new Error('Error server while trying to request the server');
        }
    } catch (error) {
        console.log(error)
    }

}

async function copyApiKey(e) {
    await navigator.clipboard.writeText(e.apiKey)
    alert(`Api key ${e.name} copied!`)
}

function deleteApiKey(e) {
    let tmpKey = e.apiKey
    let isDelete = true
    pushToServer(tmpKey, isDelete, e)
}

function pushToServer(key, isDelete, element) {
    fetch("/dashboard/apiKey", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ key, isDelete })
    })

        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data.isKeyDeleted) {
                alert(`API Key ${element.name} successfully deleted!`)
                location.reload()
            }
            else {
                alert(`API Key ${element.name} failed to delete!`)
                location.reload()

            }

        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('An error occurred. Please try again later.');
        });

}

async function addApiKey() {
    companyAccessSection.forEach(item => {
        item.style.display = "block"
    })
    toDo.innerHTML = "Add API Key 🔑"
    toDoLabel.innerHTML = "Key Name:"
    submitButton.innerHTML = "Add Key"
    shellLayout.style.display = "none"
    sectionHeader.style.display = "none"
    inputName.setAttribute("placeholder", "KeyName")
    createForm.setAttribute("onsubmit", "submitApi(event); return false;")
    addFrom()


}
function addFrom() {

    itemPageWrapper.style.display = "flex";
    ItemWrapper.style.display = "flex";
    setTimeout(() => {
        itemPageWrapper.style.opacity = '1';
    }, 50);

}

function closeForm() {
    shellLayout.style.display = "block"
    sectionHeader.style.display = "block"
    itemPageWrapper.style.opacity = '0';
    setTimeout(() => {
        itemPageWrapper.style.display = "none";
    }, 300);
    formName.value = "";

}
function submitApi(event) {
    let companiesList = document.querySelectorAll(".item")
    let selectedCompanies = []
    companiesList.forEach(company => {
        if (company.classList.contains("checked")) {
            selectedCompanies.push(company.getAttribute("obj-id"))
        }
    })
    if (selectedCompanies.length >= 1) {
        let apiName = formName.value;

        fetch("/dashboard/apiKey", {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ apiKeyName: apiName, selectedCompanies })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error server while trying to request the server');
                }
            })
            .then(data => {
                if (data.successfully) {
                    alert(data.message)
                    location.reload();
                } else {
                    alert(data.message)
                    location.reload();
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    }
    else {
        alert("Please select a company!")
        return
    }
}


async function buildDropdown() {
    const data = await fetchCompanies();
    const allCompanies = data.allCompanies;

    if (allCompanies.length !== 0) {
        var list = document.querySelector('.list-items');

        allCompanies.forEach(function (company) {
            const existingEl = list.querySelector(`[obj-id="${company.companyId}"]`);
            if (!existingEl) {
                var li = document.createElement('li');
                li.classList.add('item');
                li.setAttribute("obj-id", company.companyId)

                var checkboxSpan = document.createElement('span');
                checkboxSpan.classList.add('checkbox');
                var checkboxIcon = document.createElement('i');
                checkboxIcon.classList.add('fa-solid', 'fa-check', 'check-icon');
                checkboxSpan.appendChild(checkboxIcon);
                li.appendChild(checkboxSpan);

                var textSpan = document.createElement('span');
                textSpan.classList.add('item-text');
                textSpan.textContent = company.name;
                li.appendChild(textSpan);

                list.appendChild(li);
            }
        });
        let items = document.querySelectorAll(".item");
        let btnText = document.querySelector(".btn-text")
        let checked
        items.forEach(item => {
            item.addEventListener("click", () => {
                if (item.classList.contains("checked")) {
                    removeCheck(item)
                    checked = "";
                }
                else {
                    removeCheck()
                    checked = item.querySelector(".item-text").innerText
                    item.classList.toggle("checked");
                }

                if (checked && checked.length > 0) {
                    btnText.innerText = `${checked} selected`;
                } else {
                    btnText.innerText = "No company selected";
                }
            })
        })
    }
    else {
        const checked = document.querySelectorAll(".checked");
        const btnText = document.querySelector(".btn-text");
        const listItems = document.querySelector(".list-items")

        btnText.innerText = "No companies to select";
        listItems.style.display = "none";
    }
}
