const wrapper = document.querySelector(".captcha-settings-wrapper")
const canvas = wrapper.querySelector(".canvas")
const captchaContainer = wrapper.querySelector(".captcha-container")
const buttonColor = document.querySelector(".ButtonColor");
const buttonColorPicker = buttonColor.querySelector("input");
const buttonOnHoverColor = document.querySelector(".ButtonOnHoverColor");
const buttonOnHoverColorPicker = buttonOnHoverColor.querySelector("input");
const selectedCubeColor = document.querySelector(".SelectedCubeColor");
const selectedCubeColorPicker = selectedCubeColor.querySelector("input");
const canvasOnHoverColor = document.querySelector(".OnHoverColor");
const canvasOnHoverColorPicker = canvasOnHoverColor.querySelector("input");
const title = captchaContainer.querySelector("h1")
const captchaUpperSettings = document.querySelector(".captcha-settings-upper")
const titleInput = captchaUpperSettings.querySelector("input")
const buttons = captchaContainer.querySelectorAll("button");

let buttonColorValue
let buttonColorHoverValue
let selectedCubeColorValue
let canvasOnHoverColorValue
let titleInputValue
let cubes
let returnedColorKit
let isResetColorKit = false

document.addEventListener("DOMContentLoaded", initialize);

async function initialize() {
    await buildCubes();
    await getColorKit();
    setColors();
    captchaContainer.style.display = "flex";
    cubes = canvas.querySelectorAll('.cube');

}

async function buildCubes() {
    const numbCubes = 961;
    for (let i = 1; i < numbCubes; i++) {
        const cube = document.createElement('div');
        cube.classList.add('cube');
        cube.setAttribute('id', i);
        canvas.appendChild(cube);
    }

}

function resetCaptcha() {
    cubes.forEach(cube => {
        if (cube.classList.contains('selected')) {
            cube.classList.remove('selected');
            cube.style.backgroundColor = ""

        }
    });
}

function setColors(){
    buttonColorValue = buttonColorPicker.value;
    buttonColorHoverValue = buttonOnHoverColorPicker.value;
    selectedCubeColorValue = selectedCubeColorPicker.value;
    canvasOnHoverColorValue = canvasOnHoverColorPicker.value;
    titleInputValue = titleInput.value
}

function resetColorKit(){
    isResetColorKit  = true;
    submitColorKit()
}

async function getColorKit() {
    fetch("/captchaSettings", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
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
            console.log(data.message)
            console.log(data.returnedColorKit)
            returnedColorKit = data.returnedColorKit
            buttonColorPicker.value = returnedColorKit.buttonColorValue
            buttonOnHoverColorPicker.value = returnedColorKit.buttonColorHoverValue
            selectedCubeColorPicker.value = returnedColorKit.selectedCubeColorValue
            canvasOnHoverColorPicker.value = returnedColorKit.canvasOnHoverColorValue
            titleInput.value = returnedColorKit.titleInputValue
            setColors()
            updateButtonColors()
            updateCubeColors()
            updateTitle()
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


captchaContainer.style.display = "flex";
let mouseIsDown = false
let containerCubes

captchaContainer.addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
captchaContainer.addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
captchaContainer.querySelector('.canvas').addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
    event.preventDefault()
    if (mouseIsDown) {
        const firstElement = event.composedPath()[0]
        if (firstElement.classList.contains("cube")) {
            firstElement.classList[toggle ? "toggle" : "add"]("selected")
            firstElement.style.backgroundColor = selectedCubeColorValue

        }
    }
})


function updateButtonColors() {
    buttons.forEach(button => {
        button.style.backgroundColor = buttonColorValue;
        button.addEventListener("mouseover", function () {
            button.style.backgroundColor = buttonColorHoverValue;
        });
        button.addEventListener("mouseout", function () {
            button.style.backgroundColor = buttonColorValue;
        });
    });
}

function updateCubeColors() {
    cubes.forEach(cube => {
        if (cube.classList.contains('selected')) {
            cube.style.backgroundColor = selectedCubeColorValue;
        } else {
            cube.style.backgroundColor = "";
        }
        cube.addEventListener("mouseover", function () {
            if (!cube.classList.contains('selected')) {
                cube.style.backgroundColor = canvasOnHoverColorValue;
            }
        });
        cube.addEventListener("mouseout", function () {
            if (!cube.classList.contains('selected')) {
                cube.style.backgroundColor = "";
            }
        });
    });
}

function updateTitle(){
    title.innerHTML = titleInputValue
}


buttonColor.addEventListener("change", function () {
    buttonColorValue = buttonColorPicker.value;
    updateButtonColors();
});

buttonOnHoverColor.addEventListener("change", function () {
    buttonColorHoverValue = buttonOnHoverColorPicker.value;
    updateButtonColors();
});

selectedCubeColor.addEventListener("change", function () {
    selectedCubeColorValue = selectedCubeColorPicker.value;
    updateCubeColors();
});

canvasOnHoverColor.addEventListener("change", function () {
    canvasOnHoverColorValue = canvasOnHoverColorPicker.value;
    updateCubeColors();
});

titleInput.addEventListener("change", function () {
    titleInputValue = titleInput.value
    updateTitle()

})

async function submitColorKit() {
    const requestData = {
        buttonColorValue: buttonColorValue,
        buttonColorHoverValue: buttonColorHoverValue,
        selectedCubeColorValue: selectedCubeColorValue,
        canvasOnHoverColorValue: canvasOnHoverColorValue,
        titleInputValue: titleInputValue,
        isResetColorKit: isResetColorKit
    };

    try {
        const response = await fetch("/dashboard/captchaSettings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        if (response.ok) {
            const responseData = await response.json();
            if (responseData.message) {
                alert(responseData.message);
                location.reload()
            } else {
                console.log("An error occurred while trying to fetch data from the Server");
            }
        } else {
            throw new Error("Server responded with an error status: " + response.status);
        }
    } catch (error) {
        console.error("Fetch error: ", error);
        alert("An error occurred. Please try again later.");
    }
}
