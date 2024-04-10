const elementList = document.querySelector(".element-list");
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
        })

        if (response.ok) {
            const data = await response.json();
            const pool = data.pool;

            console.log(pool)

            pool.forEach(elementData => {
                const wrapper = document.querySelector(".stacked-list1_list-wrapper");

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

                contentRight.appendChild(dropdownComponent);

                item.appendChild(avatar);
                item.appendChild(contentRight);

                wrapper.appendChild(item);

                elementList.appendChild(wrapper);
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

let mouseIsDown = false
cube = document.querySelectorAll(".cube-true")


self.addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
self.addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
document.querySelectorAll('.canvas').forEach(canvas =>
    canvas.addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
        event.preventDefault()
        if (mouseIsDown) {
            const firstElement = event.composedPath()[0]
            if (firstElement.classList.contains("cube")) {
                firstElement.classList[toggle ? "toggle" : "add"]("selected")
            }
        }
    }))


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