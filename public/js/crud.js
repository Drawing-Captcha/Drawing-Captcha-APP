const serverPull = "/getElements";
const container = document.querySelector(".container")
const contentContainer = document.querySelector(".content-container")
const parentContainer = document.querySelector(".parent-container")
const wrapper = document.querySelector(".wrapper")
const canvas = document.querySelectorAll(".canvas")
const cubeTrue = document.querySelectorAll(".cube-true")
const cubeMin = document.querySelectorAll(".cube-min")
const cubeMax = document.querySelectorAll(".cube-max")
const cubeID = document.querySelectorAll("#id")
let tmpPool = [];
let pool;
var isDelete;

document.addEventListener("DOMContentLoaded", initialize);

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
            const pool = data.pool;

            const wrapper = document.querySelector(".stacked-list1_list-wrapper");

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
                deleteButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V19C19 19.5304 18.7893 20.0391 18.4142 20.4142C18.0391 20.7893 17.5304 21 17 21H7C6.46957 21 5.96086 20.7893 5.58579 20.4142C5.21071 20.0391 5 19.5304 5 19V6H19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
                deleteButton.addEventListener("click", () => deleteComponent(elementData));
            
                const editButton = document.createElement("button");
                editButton.classList.add("iconButton", "is-icon-only");
                editButton.innerHTML = '<svg width="fit-content" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M21 4L20.327 4.673L19 3.345L19.673 2.672C19.875 2.471 19.875 2.128 19.673 1.927L18.073 0.327C17.872 0.126 17.529 0.126 17.328 0.327L16.655 1C15.788 1.867 14.212 1.867 13.345 1L3 11.345V15H6.655L16 5.655L17.345 4.309C17.546 4.108 17.889 4.108 18.09 4.309L19.691 5.909C19.892 6.11 19.892 6.453 19.691 6.654L19 7.345L21 5.345L21 4ZM3 17H4V20H21V19H5V17H3V17Z" fill="currentColor"/></svg>';
                editButton.addEventListener("click", () => getComponent(elementData));
            
                droppDownToggle.appendChild(deleteButton);
                droppDownToggle.appendChild(editButton);
                dropdownComponent.appendChild(droppDownToggle);
                contentRight.appendChild(dropdownComponent);
                item.appendChild(avatar);
                item.appendChild(contentRight);
                wrapper.appendChild(item);
            });
            

        } else {
            throw new Error('Fehler bei der Serveranfrage.');
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

function getComponent(e) {
    wrapper.style.display = "none"
    parentContainer.style.display = "flex"
    canvas.forEach(canvas =>
        canvas.style = `background-image: url(${e.URL});`
    )

    pool = e
    tmpPool.push(pool)
    console.log("tmpPool: ", tmpPool)
    syncCubes();

    console.log(e.Name)
}

// let mouseIsDown = false
// cube = document.querySelectorAll(".cube-true")


// self.addEventListener('mousedown', event => {
//     mouseIsDown = true
//     drawEventListener(event, true)
// })
// self.addEventListener('mouseup', event => (mouseIsDown = false))
// let drawEventListener
// document.querySelectorAll('.canvas').forEach(canvas =>
//     canvas.addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
//         event.preventDefault()
//         if (mouseIsDown) {
//             const firstElement = event.composedPath()[0]
//             if (firstElement.classList.contains("cube")) {
//                 firstElement.classList[toggle ? "toggle" : "add"]("selected")
//             }
//         }
//     }))


function resetTrue() {
    cubeTrue.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

function resetMin() {
    cubeMin.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}

function resetMax() {
    cubeMax.forEach(function (cube) {
        cube.classList.remove("selected");
    });
}



function syncCubes() {

    cubeTrue.forEach(cubeElement => {
        if (pool.ValidateF.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });

    cubeMin.forEach(cubeElement => {
        if (pool.validateMinCubes.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });
    cubeMax.forEach(cubeElement => {
        if (pool.validateMaxCubes.includes(cubeElement.getAttribute("id"))) {
            cubeElement.classList.add("selected");
            console.log("selected");
        }
    });


}

function finishUpdate() {
    const validateTrueCubes = Array.from(document.querySelectorAll(".cube-true"))
        .filter(cube => cube.classList.contains("selected"))
        .map(cube => cube.getAttribute("id"));

    const validateMinCubes = Array.from(document.querySelectorAll(".cube-min"))
        .filter(cube => cube.classList.contains("selected"))
        .map(cube => cube.getAttribute("id"));

    const validateMaxCubes = Array.from(document.querySelectorAll(".cube-max"))
        .filter(cube => cube.classList.contains("selected"))
        .map(cube => cube.getAttribute("id"));



    tmpPool[0].ValidateF = validateTrueCubes;
    tmpPool[0].validateMinCubes = validateMinCubes;
    tmpPool[0].validateMaxCubes = validateMaxCubes;

    pushToServer()
}

function pushToServer() {

    console.log(tmpPool);

    const API = '/CRUD'
    fetch(API, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tmpPool, isDelete })
    })

        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Fehler bei der Serveranfrage.');
            }
        })
        .then(data => {
            if (data.isGood) {
                alert("Änderungen Erfolgreich am CRUD durchgenommen!")
                location.replace("./")

            }
            else {
                alert("Es ist ein Fehler aufgetreten schaue die Datenverarbeitung des CRUDS im Backend an")
            }

        })
        .catch(error => {
            console.error('Fehler:', error);
            alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
        });


}



function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}