const serverPull = "/dashboard/getElements";
const container = document.querySelector(".container")
const contentContainer = document.querySelector(".content-container")
const parentContainer = document.querySelector(".parent-container")
const canvas = document.querySelectorAll(".canvas")
const cubeTrue = document.querySelectorAll(".cube-true")
const cubeMin = document.querySelectorAll(".cube-min")
const cubeMax = document.querySelectorAll(".cube-max")
const cubeID = document.querySelectorAll("#id")
const wrapper = document.querySelector(".stacked-list1_list-wrapper");
const captchaContainer = document.querySelectorAll(".captcha-container");
const captchaItemName = document.querySelector("input#captchaItemName");
const header = document.querySelector(".section-header2_content-wrapper");
const toDo = document.querySelector(".editToDO")
const editItemParent = document.querySelector(".editItemParent")
const currentItems = document.querySelector(".currentItems")
const rangeInput = document.querySelector('input[type="range"]');
const imageResizeValue = document.querySelector("#imageResizerValue")
const toDoDescription = document.querySelector("#todoDescription")
const selectBtn = document.querySelector(".select-btn")
const companyItemsWrapper = document.querySelector(".list-items")
const notCategorizedWrapper = document.querySelector(".not-categorized")


let tmpPool = [];
let pool;
var isDelete;
let validateTrueCubes;
let validateMinCubes;
let validateMaxCubes;
let itemName;
let backgroundSize;
let todoTitle;
let companies = [];

document.addEventListener("DOMContentLoaded", initialize);

rangeInput.addEventListener('change', updateBackgroundSize);

function updateBackgroundSize() {
    backgroundSize = rangeInput.value + "%";
    imageResizeValue.innerHTML = backgroundSize

    canvas.forEach(canvas => {
        var existingStyles = canvas.getAttribute('style')
        var updatedStyles = `${existingStyles} background-size: ${backgroundSize};`
        canvas.setAttribute('style', updatedStyles)
    })

}

async function initialize() {
    await getPool();
    await initCompanies();
    await getNotCategorizedItems();
}

async function getPool() {
    try {
        const response = await fetch(`${serverPull}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const pool = data.globalPool;
            const userRole = data.userRole;

            if (pool.length != 0) {

                pool.forEach(elementData => {
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
                    deleteButton.innerHTML = '<svg width="24" color="#ffff" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    deleteButton.addEventListener("click", () => deleteComponent(elementData));

                    const editButton = document.createElement("button");
                    editButton.classList.add("iconButton", "is-icon-only");
                    editButton.innerHTML = `<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
                    
                    </svg>`;
                    editButton.addEventListener("click", () => getComponent(elementData));

                    if (!elementData.initialCaptcha && userRole != "read") {
                        droppDownToggle.appendChild(deleteButton);
                        droppDownToggle.appendChild(editButton);
                    }
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

async function getComponent(e) {
    await getCompanies(e);
    removeCurrentItems();

    toDo.innerHTML = `Edit item: ${e.Name}`;
    editItemParent.style.display = "block";

    buildCubes();
    pool = e
    tmpPool.push(pool)
    captchaContainer.forEach(container => {
        container.style.display = "flex";
        let mouseIsDown = false
        let containerCubes

        container.addEventListener('mousedown', event => {
            mouseIsDown = true
            drawEventListener(event, true)
        })
        container.addEventListener('mouseup', event => (mouseIsDown = false))
        let drawEventListener
        container.querySelector('.canvas').addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
            event.preventDefault()
            if (mouseIsDown) {
                const firstElement = event.composedPath()[0]
                if (firstElement.classList.contains("cube")) {
                    firstElement.classList[toggle ? "toggle" : "add"]("selected")
                }
            }
        })

        let containerCanvas = container.querySelector(".canvas");

        containerCanvas.style.backgroundImage = `url(${e.URL})`;


        switch (container.getAttribute("id")) {
            case "True":
                containerCubes = containerCanvas.querySelectorAll(".cube");
                containerCubes.forEach(cube => {
                    if (e.ValidateF.includes(cube.getAttribute("id"))) {
                        cube.classList.add("selected");
                    }
                })
                break;
            case "Min":
                containerCubes = containerCanvas.querySelectorAll(".cube");
                containerCubes.forEach(cube => {
                    if (e.validateMinCubes.includes(cube.getAttribute("id"))) {
                        cube.classList.add("selected");
                    }
                })
                break;
            case "Max":
                containerCubes = containerCanvas.querySelectorAll(".cube");
                containerCubes.forEach(cube => {
                    if (e.validateMaxCubes.includes(cube.getAttribute("id"))) {
                        cube.classList.add("selected");
                    }
                })
                break;
            default:
                console.log("no cubes to fill out");
        }

    })
    captchaItemName.value = e.Name
    rangeInput.value = e.backgroundSize ? e.backgroundSize : 70
    updateBackgroundSize()
    toDoDescription.value = e.todoTitle ? e.todoTitle : ""


}

function deleteComponent(e) {
    if (confirm("Are you sure you want to delete this Item")) {
        pool = e
        tmpPool.push(pool)
        isDelete = true
        pushToServer()
    }
    else {
        return
    }
}

function pushToServer() {
    fetch("/dashboard/crud", {
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
                alert("Changes successfully implemented on CRUD system")
                location.reload()
            }
            else {
                alert("An error occurred, check the data processing of the CRUD system in the backend")
                location.reload()

            }

        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('An error occurred. Please try again later.');
        });


}

function buildCubes() {
    canvas.forEach(canvasItem => {

        const numbCubes = 961;
        for (let i = 1; i < numbCubes; i++) {
            const cube = document.createElement('div');
            cube.classList.add('cube');
            cube.setAttribute('id', i);
            canvasItem.appendChild(cube);
        }
    })
}

function resetElement(button) {
    const container = button.closest('.captcha-container');
    if (container) {
        reset(container);
    } else {
        console.error("Parent container not found.");
    }
}

function reset(container) {
    const canvas = container.querySelector('.canvas');
    const cubes = canvas.querySelectorAll('.cube');
    cubes.forEach(cube => {
        if (cube.classList.contains('selected')) {
            cube.classList.remove('selected');
        }
    });
}

function finishUpdate() {
    const companyItems = companyItemsWrapper.querySelectorAll(".item")

    companyItems.forEach(item => {
        if (item.classList.contains("checked")) {
            companies.push(item.getAttribute("obj-id"))
        }
    })

    itemName = document.querySelector("#captchaItemName").value
    todoTitle = toDoDescription.value
    backgroundSize = rangeInput.value
    captchaContainer.forEach(container => {
        let containerCanvas = container.querySelector(".canvas");

        switch (container.getAttribute("id")) {
            case "True":
                validateTrueCubes = Array.from(containerCanvas.querySelectorAll(".cube"))
                    .filter(cube => cube.classList.contains("selected"))
                    .map(cube => cube.getAttribute("id"));
                break;
            case "Min":
                validateMinCubes = Array.from(containerCanvas.querySelectorAll(".cube"))
                    .filter(cube => cube.classList.contains("selected"))
                    .map(cube => cube.getAttribute("id"));
                break;
            case "Max":
                validateMaxCubes = Array.from(containerCanvas.querySelectorAll(".cube"))
                    .filter(cube => cube.classList.contains("selected"))
                    .map(cube => cube.getAttribute("id"));
                break;
            default:
                console.log("no cubes to fill out");
        }
    })

    tmpPool[0].Name = itemName;
    tmpPool[0].ValidateF = validateTrueCubes;
    tmpPool[0].validateMinCubes = validateMinCubes;
    tmpPool[0].validateMaxCubes = validateMaxCubes;
    tmpPool[0].todoTitle = todoTitle;
    tmpPool[0].backgroundSize = backgroundSize;
    tmpPool[0].companies = companies;

    pushToServer()
}

function closeForm() {
    captchaContainer.forEach(container => {
        reset(container)
    })
    editItemParent.style.display = "none";
    displayCurrentItems();

}

function removeCurrentItems() {
    currentItems.style.display = "none"
    document.querySelector(".half").style.display = "none"
    let allWrapper = document.querySelectorAll(".stacked-list1_component");
    allWrapper.forEach(wrapper => {
        if(!wrapper.classList.contains("editItemParent")){
            wrapper.style.display = "none"
        }
    })
    window.scrollTo(0, 0)
}

function displayCurrentItems() {
    currentItems.style.display = "block"
}

async function getCompanies(e) {
    try {
        const response = await fetch("/company", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const allCompanies = data.allCompanies;

            if (allCompanies.length !== 0) {

                var list = document.querySelector('.list-items');
                allCompanies.forEach(function (company) {
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
                });
                let items = document.querySelectorAll(".item");
                let assignedCompanies = e.companies

                items.forEach(item => {
                    if (assignedCompanies.includes(item.getAttribute("obj-id"))) {
                        item.classList.add("checked");
                    }
                    item.addEventListener("click", () => {
                        item.classList.toggle("checked");
                        setButtonText()

                    });
                })
                setButtonText()

            }
        } else {
            throw new Error('Error from server while trying to request the server');
        }
    } catch (error) {
        console.log('Error in getCompanies:', error);
    }
}

function setButtonText() {
    let checked = document.querySelectorAll(".checked");
    let btnText = document.querySelector(".btn-text");

    if (checked && checked.length > 0) {
        btnText.innerText = `${checked.length} Selected`;
    } else {
        btnText.innerText = "Select Company";
    }
}

selectBtn.addEventListener("click", () => {
    selectBtn.classList.toggle("open");
});

function closeSelectBtn() {
    if (selectBtn.classList.contains("open")) {
        selectBtn.classList.remove("open");
    }
}

function createCompanySection(company) {
    return `
    <div class="section_shell2-layout ${company.name}" companyId="${company.companyId}">
        <div class="padding-horizontal padding-medium">
            <div class="container-large">
                <div class="padding-vertical padding-large padding-custom">
                    <div id="w-node-_1a30a1e4-8a69-abdf-86cf-348aa176e587-0240322d" class="w-layout-grid shell2-layout_component">
                        <div class="stacked-list1_component currentItems">
                            <div class="section-header2_component">
                                <div class="padding-bottom padding-small">
                                    <div class="section-header2_content-wrapper">
                                        <div class="max-width-large">
                                            <div class="company-header">
                                                <h2 class="heading-style-h5">${company.name}</h2>
                                                <div class="logo-section">
                                                    <img src="${company.ppURL ? company.ppURL : "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg"}" alt="${company.name} Logo" class="company-logo">
                                                </div>
                                            </div>
                                            <div class="margin-top margin-xxsmall"></div>
                                        </div>
                                        <div class="section-header2_content-right">
                                            <button onclick="window.location.reload()">
                                            <!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                                             <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">

                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />

                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

                                    <g id="SVGRepo_iconCarrier">
                                      <path
                                        d="M18.43 4.25C18.2319 4.25259 18.0426 4.33244 17.9025 4.47253C17.7625 4.61263 17.6826 4.80189 17.68 5V7.43L16.84 6.59C15.971 5.71363 14.8924 5.07396 13.7067 4.73172C12.5209 4.38948 11.2673 4.35604 10.065 4.63458C8.86267 4.91312 7.7515 5.49439 6.83703 6.32318C5.92255 7.15198 5.23512 8.20078 4.84001 9.37C4.79887 9.46531 4.77824 9.56821 4.77947 9.67202C4.7807 9.77583 4.80375 9.87821 4.84714 9.97252C4.89052 10.0668 4.95326 10.151 5.03129 10.2194C5.10931 10.2879 5.20087 10.3392 5.30001 10.37C5.38273 10.3844 5.4673 10.3844 5.55001 10.37C5.70646 10.3684 5.85861 10.3186 5.98568 10.2273C6.11275 10.136 6.20856 10.0078 6.26001 9.86C6.53938 9.0301 7.00847 8.27681 7.63001 7.66C8.70957 6.58464 10.1713 5.98085 11.695 5.98085C13.2188 5.98085 14.6805 6.58464 15.76 7.66L16.6 8.5H14.19C13.9911 8.5 13.8003 8.57902 13.6597 8.71967C13.519 8.86032 13.44 9.05109 13.44 9.25C13.44 9.44891 13.519 9.63968 13.6597 9.78033C13.8003 9.92098 13.9911 10 14.19 10H18.43C18.5289 10.0013 18.627 9.98286 18.7186 9.94565C18.8102 9.90844 18.8934 9.85324 18.9633 9.78333C19.0333 9.71341 19.0885 9.6302 19.1257 9.5386C19.1629 9.44699 19.1814 9.34886 19.18 9.25V5C19.18 4.80109 19.101 4.61032 18.9603 4.46967C18.8197 4.32902 18.6289 4.25 18.43 4.25Z"
                                        fill="#ffffff" />
                                      <path
                                        d="M18.68 13.68C18.5837 13.6422 18.4808 13.6244 18.3774 13.6277C18.274 13.6311 18.1724 13.6555 18.0787 13.6995C17.9851 13.7435 17.9015 13.8062 17.8329 13.8836C17.7643 13.9611 17.7123 14.0517 17.68 14.15C17.4006 14.9799 16.9316 15.7332 16.31 16.35C15.2305 17.4254 13.7688 18.0291 12.245 18.0291C10.7213 18.0291 9.25957 17.4254 8.18001 16.35L7.34001 15.51H9.81002C10.0089 15.51 10.1997 15.431 10.3403 15.2903C10.481 15.1497 10.56 14.9589 10.56 14.76C10.56 14.5611 10.481 14.3703 10.3403 14.2297C10.1997 14.089 10.0089 14.01 9.81002 14.01H5.57001C5.47115 14.0086 5.37302 14.0271 5.28142 14.0643C5.18982 14.1016 5.1066 14.1568 5.03669 14.2267C4.96677 14.2966 4.91158 14.3798 4.87436 14.4714C4.83715 14.563 4.81867 14.6611 4.82001 14.76V19C4.82001 19.1989 4.89903 19.3897 5.03968 19.5303C5.18034 19.671 5.3711 19.75 5.57001 19.75C5.76893 19.75 5.95969 19.671 6.10034 19.5303C6.241 19.3897 6.32001 19.1989 6.32001 19V16.57L7.16001 17.41C8.02901 18.2864 9.10761 18.926 10.2934 19.2683C11.4791 19.6105 12.7327 19.6439 13.935 19.3654C15.1374 19.0869 16.2485 18.5056 17.163 17.6768C18.0775 16.848 18.7649 15.7992 19.16 14.63C19.1926 14.5362 19.2061 14.4368 19.1995 14.3377C19.1929 14.2386 19.1664 14.1418 19.1216 14.0532C19.0768 13.9645 19.0146 13.8858 18.9387 13.8217C18.8629 13.7576 18.7749 13.7094 18.68 13.68Z"
                                        fill="#ffffff" />
                                    </g>

                                  </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="stacked-list1_list-wrapper"></div>
                        </div>
                        <!-- Rest des Codes bleibt gleich -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}

async function initCompanies() {
    try {
        const response = await fetch("/company", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const allCompanies = data.allCompanies;
            let mainWrapper = document.querySelector('.shell2_main-wrapper');

            if (allCompanies.length !== 0) {
                allCompanies.forEach(function (company) {
                    let companySection = createCompanySection(company);
                    mainWrapper.insertAdjacentHTML('beforeend', companySection);
                    let companyWrapper = document.querySelector(`.section_shell2-layout.${company.name}`)
                    getPoolForEachCompany(companyWrapper)
                });
            }
        } else {
            throw new Error('Error from server while trying to request the server');
        }
    } catch (error) {
        console.log('Error in getCompanies:', error);
    }
}



async function getPoolForEachCompany(companyWrapper) {
    try {
        const response = await fetch(`${serverPull}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const pool = data.globalPool;
            const userRole = data.userRole;

            let itemsWrapper = companyWrapper.querySelector(".stacked-list1_list-wrapper")
        
            if (pool.length != 0 && pool.some(elementData => elementData.companies.includes(companyWrapper.getAttribute("companyId")))) {
                pool.forEach(elementData => {
                    if (elementData.companies.includes(companyWrapper.getAttribute("companyId"))) {

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
                        deleteButton.innerHTML = '<svg width="24" color="#ffff" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                        deleteButton.addEventListener("click", () => deleteComponent(elementData));

                        const editButton = document.createElement("button");
                        editButton.classList.add("iconButton", "is-icon-only");
                        editButton.innerHTML = `<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
                    
                    </svg>`;
                        editButton.addEventListener("click", () => getComponent(elementData));

                        if (!elementData.initialCaptcha && userRole != "read") {
                            droppDownToggle.appendChild(deleteButton);
                            droppDownToggle.appendChild(editButton);
                        }
                        dropdownComponent.appendChild(droppDownToggle);
                        contentRight.appendChild(dropdownComponent);
                        item.appendChild(avatar);
                        item.appendChild(contentRight);
                        itemsWrapper.appendChild(item);
                    } 

     
                });

            }
            else {
                const syncWrapper = document.createElement("div")
                syncWrapper.classList.add("syncWrapper")

                syncWrapper.addEventListener("click", () => window.location.reload())
                syncWrapper.style.cursor = "pointer"


                const syncMessage = document.createElement("h3")
                syncMessage.innerHTML = "No items in pool currently, sync here.. 🤔🔄"

                itemsWrapper.appendChild(syncWrapper)
                syncWrapper.appendChild(syncMessage)
                syncWrapper.appendChild(syncButton)

            }



        } else {
            throw new Error('Error server while trying to request the server');
        }
    }catch (error) {
        console.log(error)
    }
}

async function getNotCategorizedItems() {
    try {
        const response = await fetch("/dashboard/getElements/notCategorized", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (response.ok) {
            const data = await response.json();
            const pool = data.globalPool;
            const userRole = data.userRole;

            let notCategorizedItemsWrapper = notCategorizedWrapper.querySelector(".stacked-list1_list-wrapper")

            if (pool.length != 0) {

                pool.forEach(elementData => {
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
                    deleteButton.innerHTML = '<svg width="24" color="#ffff" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                    deleteButton.addEventListener("click", () => deleteComponent(elementData));

                    const editButton = document.createElement("button");
                    editButton.classList.add("iconButton", "is-icon-only");
                    editButton.innerHTML = `<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <g id="SVGRepo_iconCarrier"> <path d="M21.2799 6.40005L11.7399 15.94C10.7899 16.89 7.96987 17.33 7.33987 16.7C6.70987 16.07 7.13987 13.25 8.08987 12.3L17.6399 2.75002C17.8754 2.49308 18.1605 2.28654 18.4781 2.14284C18.7956 1.99914 19.139 1.92124 19.4875 1.9139C19.8359 1.90657 20.1823 1.96991 20.5056 2.10012C20.8289 2.23033 21.1225 2.42473 21.3686 2.67153C21.6147 2.91833 21.8083 3.21243 21.9376 3.53609C22.0669 3.85976 22.1294 4.20626 22.1211 4.55471C22.1128 4.90316 22.0339 5.24635 21.8894 5.5635C21.7448 5.88065 21.5375 6.16524 21.2799 6.40005V6.40005Z" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> <path d="M11 4H6C4.93913 4 3.92178 4.42142 3.17163 5.17157C2.42149 5.92172 2 6.93913 2 8V18C2 19.0609 2.42149 20.0783 3.17163 20.8284C3.92178 21.5786 4.93913 22 6 22H17C19.21 22 20 20.2 20 18V13" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/> </g>
                    
                    </svg>`;
                    editButton.addEventListener("click", () => getComponent(elementData));

                    if (!elementData.initialCaptcha && userRole != "read") {
                        droppDownToggle.appendChild(deleteButton);
                        droppDownToggle.appendChild(editButton);
                    }
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    notCategorizedItemsWrapper.appendChild(item);
                });

            }
            else {
                const syncWrapper = document.createElement("div")
                syncWrapper.classList.add("syncWrapper")

                syncWrapper.addEventListener("click", () => window.location.reload())
                syncWrapper.style.cursor = "pointer"


                const syncMessage = document.createElement("h3")
                syncMessage.innerHTML = "No items in pool currently, sync here.. 🤔🔄"

                notCategorizedItemsWrapper.appendChild(syncWrapper)
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