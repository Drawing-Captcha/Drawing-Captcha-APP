const createItemWrapper = document.querySelector(".itemWrapper-createItem");
const toDo = createItemWrapper.querySelector("h3");
const CaptureForm = document.querySelector("#Capture");
const innerBox = createItemWrapper.querySelector(".innerToDoBox");
const fileInput = document.querySelector("#myFileinput");
const discard = document.querySelector(".discard");
const changeImageButton = document.querySelector(".changeImgBtn");
const captchaCanvas = document.querySelector(".captchta-canvas");
const captchaContainer = document.querySelector(".captcha-container");
const canvas = captchaContainer.querySelector(".canvas");
const cube = document.querySelectorAll(".cube");
const cnameInput = document.querySelector("#ComponentName");
const ItemWrapper = document.querySelector(".itemWrapper");
const imageResizeWrapper = document.querySelector(".imageResizerWrapper")
const imageResizeValue = imageResizeWrapper.querySelector("label")
const rangeInput = document.querySelector('input[type="range"]');
const todoTitleWrapper = document.querySelector(".todoTitleWrapper")
const todoTextArea = todoTitleWrapper.querySelector("textarea")
const captchaTitle = captchaContainer.querySelector("h1")
const submitButton = document.querySelector(".submit-button");


let isDragging = false;
let sessionComponentName;
let backgroundImage;
let validateTrueCubes;
let validateMinCubes;
let validateMaxCubes;
let URL;
let result;
let backgroundSize;
let todoTitle
document.addEventListener('mousemove', updateSliderValue);

rangeInput.addEventListener('mousedown', () => {
    isDragging = true;
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function updateSliderValue(event) {
    if (isDragging) {
        const sliderRect = rangeInput.getBoundingClientRect();
        const offsetX = event.clientX - sliderRect.left;
        const percentage = (offsetX / sliderRect.width) * 100;
        const newValue = (percentage * (rangeInput.max - rangeInput.min)) / 100 + parseInt(rangeInput.min);
        rangeInput.value = newValue;
        updateBackgroundSize()
    }
}

function updateBackgroundSize(){
    backgroundSize = rangeInput.value + "%";
    imageResizeValue.innerHTML = backgroundSize
    var existingStyles = canvas.getAttribute('style')
    var updatedStyles = `${existingStyles} background-size: ${backgroundSize};`
    canvas.setAttribute('style', updatedStyles)

}

CaptureForm.addEventListener("submit", async function (event) {
    event.preventDefault();
    sessionComponentName = cnameInput.value;
    let doesExist = await nameExists();
    if (!doesExist) {
        CaptureForm.style.display = 'none';
        fileInput.style.display = 'block';
        toDo.innerHTML = "Upload your Image, you want to use for your Captcha.";
    } else {
        alert(`An item with ${sessionComponentName} already exists! Please choose another name.`);
        cnameInput.value = "";
    }
});

fileInput.addEventListener("change", async () => {
    const file = fileInput.files[0];
    const fileType = file.type;

    if (fileType === "image/png") {
        const reader = new FileReader();
        reader.addEventListener("load", async () => {
            const result = reader.result;
            if (result) {
                backgroundImage = result;
                captchaContainer.style.display = "flex";
                imageResizeWrapper.style.display = "flex";
                canvas.style.backgroundImage = `url(${result})`;
                buildCubes();
                toDo.innerHTML = "Please resize your image to your desired specifications! ✂️";
                fileInput.style.display = "none";
                changeImageButton.style.display = "block";
                cube.forEach(cube => {
                    cube.classList.remove("selected");
                    cube.style = "cursor: crosshair;";
                });
            }
        });

        reader.readAsDataURL(file);
    } else {
        alert("Please select a PNG file.");
        fileInput.value = ""; 
    }
});


function buildCubes() {
    const numbCubes = 961;
    for (let i = 1; i < numbCubes; i++) {
        const cube = document.createElement('div');
        cube.classList.add('cube');
        cube.setAttribute('id', i);
        canvas.appendChild(cube);
    }
}

function changeImg(){
    changeImageButton.style.display = "none";
    fileInput.style.display = "block";
    todoTitle = todoTextArea.value
    
}

let mouseIsDown = false

addEventListener('mousedown', event => {
    mouseIsDown = true
    drawEventListener(event, true)
})
addEventListener('mouseup', event => (mouseIsDown = false))
let drawEventListener
document.querySelector('.canvas').addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
    event.preventDefault()
    if (mouseIsDown) {
        const firstElement = event.composedPath()[0]
        if (firstElement.classList.contains("cube")) {
            firstElement.classList[toggle ? "toggle" : "add"]("selected")
        }
    }
})

function reset() {
    const cubes = document.querySelectorAll('.cube');
    cubes.forEach(cube => {
        if (cube.classList.contains('selected')) {
            cube.classList.remove('selected');
        }
    });
}

function continueWidth(){
    backgroundSize = rangeInput.value;
    if(backgroundImage){
        toDo.innerHTML = "Please provide a short description of what you should draw in the Drawing Captcha below. ✏️";
        imageResizeWrapper.style.display = "none"
        todoTitleWrapper.style.display = "flex"
        submitButton.setAttribute("onclick", "continueBeforeValid()")

    }
}

function continueBeforeValid(){
    todoTitle = todoTextArea.value
    innerBox.style.display = "none"
    todoTitleWrapper.style.display = "none"
    toDo.innerHTML = "Please draw the cubes on the canvas that you want to count as valid. These cubes will be considered as 'True'.✏️"
    submitButton.setAttribute("onclick", "continueValid()")
}

function continueValid() {
    toDo.innerHTML = "Please draw the cubes on the canvas that you want to count as valid. These cubes will be considered as 'True'.✏️"
    validateTrueCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    if(validateTrueCubes.length < 1){
        alert("The minimum number of cubes cannot be below 1. Please select more.")
        return
    }

    document.querySelector(".submit-button").setAttribute("onclick", "continueMin()");

    toDo.innerHTML = "Fantastic! Now, sketch out the minimum required fields for the item you intend to designate as valid. ✏️"
    changeImageButton.style.display = "none"
    reset();

}

function continueMin() {
    validateMinCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    if(validateMinCubes.length < 1){
        alert("The minimum number of cubes cannot be below 1. Please select more.")
        return
    }

    document.querySelector(".submit-button").setAttribute("onclick", "continueMax()");
    toDo.innerHTML = "Nice work! Now, for the last step, draw the maximum valid area you want to set. Draw over the item border to allow for some tolerance 🚀."
    reset();
    validateTrueCubes.forEach(cubeId => {
        var cubeElement = document.getElementById(cubeId)
        if (cubeElement) {
            cubeElement.classList.add("selected")
        }
    })


}

function continueMax() {
    validateMaxCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    if(validateMaxCubes.length < 1){
        alert("The minimum number of cubes cannot be below 1. Please select more.")
        return
    }

    pushToServer();

}


async function nameExists() {
    try {
        const response = await fetch("/dashboard/newValidation/nameExists", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sessionComponentName })
        });

        const data = await response.json();
        return data.nameExists;
    } catch (error) {
        console.error('Error checking name existence:', error);
        return false;
    }
}

function pushToServer() {
    const requestData = {
        validateTrueCubes,
        validateMinCubes,
        validateMaxCubes,
        sessionComponentName,
        backgroundImage,
        todoTitle,
        backgroundSize
    };
    console.log(requestData)
    fetch("/dashboard/newValidation", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
    })
    .then(response => {
        if (response.ok) {
            return response.json();
        } else {
            throw new Error('Server responded with an error status: ' + response.status);
        }
    })
    .then(data => {
        if (data.isValid) {
            toDo.innerHTML = "Congratulations 🎉🥳, you have successfully created an item for your Drawing-Captcha!";
            innerBox.style.display = "none";
            captchaContainer.style.display = "none";
            setTimeout(() => {
                window.location.replace("/dashboard")
            }, 2000);
        } else {
            console.log("An error occurred while trying to fetch data from the server.");
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('An error occurred. Please try again later.');
    });
}

