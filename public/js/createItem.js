const createItemWrapper = document.querySelector(".createItemWrapper");
const toDo = createItemWrapper.querySelector("h3");
const CaptureForm = document.querySelector("#Capture");
const innerBox = createItemWrapper.querySelector(".innerToDoBox");
const fileInput = document.querySelector("#myFileinput");
const discard = document.querySelector(".discard");
const changeImageButton = document.querySelector(".changeImgBtn");
const captchaCanvas = document.querySelector(".captchta-canvas");
const canvas = createItemWrapper.querySelector('.canvas');

let sessionComponentName;
let backgroundImage;
let validateTrueCubes;
let validateMinCubes;
let validateMaxCubes;
let componentName;
let URL;
let result;

CaptureForm.addEventListener("submit", function (event) {
    event.preventDefault();
    sessionComponentName = document.querySelector("#ComponentName").value;
    CaptureForm.style.display = 'none';
    fileInput.style.display = 'block';
    toDo.innerHTML = "Upload your Image, you want to use for your Captcha.";
});

fileInput.addEventListener("change", async () => {
    const reader = new FileReader();
    reader.addEventListener("load", async () => {
        const result = reader.result;

        if (result) {
            backgroundImage = result;
            captchaCanvas.style.display = "flex";
            canvas.style.backgroundImage = `url(${result})`;
            buildCubes();
            toDo.innerHTML = "Wählen Sie nun die Felder aus, die validiert werden sollen. Malen Sie genau diese, sie werden dann als gültige Felder verwendet.";
            fileInput.style.display = "none";
            changeImageButton.style.display = "block";
            discard.style.display = "block";
            cubes.forEach(cube => {
                cube.classList.remove("selected");
                cube.style = "cursor: crosshair;";
            });
        }
        console.log(result);
    });

    if (fileInput.files.length > 0) {
        reader.readAsDataURL(fileInput.files[0]);
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
