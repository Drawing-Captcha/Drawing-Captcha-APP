const createItemWrapper = document.querySelector(".itemWrapper");
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

document.addEventListener("DOMContentLoaded", initialize);

function initialize(){
   ItemWrapper.style.display = "flex";

}

let sessionComponentName;
let backgroundImage;
let validateTrueCubes;
let validateMinCubes;
let validateMaxCubes;
let URL;
let result;


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
                canvas.style.backgroundImage = `url(${result})`;
                buildCubes();
                toDo.innerHTML = "If your selected image is displayed, please draw the corresponding valid fields for your item. Ensure that the drawn fields cover the entirety of the item you wish to use for validation.";
                fileInput.style.display = "none";
                changeImageButton.style.display = "block";
                discard.style.display = "block";
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
    discard.style.display = "none";
    changeImageButton.style.display = "none";
    fileInput.style.display = "block";

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

function continueValid() {
    validateTrueCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

    document.querySelector(".submit-button").setAttribute("onclick", "continueMin()");

    toDo.innerHTML = "Fantastic! Now, sketch out the minimum required fields for the item you intend to designate as valid. ✏️"
    changeImageButton.style.display = "none"
    reset();

}

function continueMin() {
    validateMinCubes = Array.from(document.querySelectorAll(".cube")).filter(cube => cube.classList.contains("selected")).map(cube => cube.id);

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

    pushToServer();

}


async function nameExists() {
    try {
        const response = await fetch("/newValidation/nameExists", {
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
        backgroundImage
    };

    fetch("/newValidation", {
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
                window.location.reload();
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

