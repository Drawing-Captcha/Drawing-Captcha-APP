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
            console.log(userRole)

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
        if(item.classList.contains("checked")){
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
