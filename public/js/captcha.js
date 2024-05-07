const captchaComponent = document.querySelector("captcha-component");
const errorMessage = document.querySelector(".captcha-error-message");
const successMessage = document.querySelector(".captcha-success-message");
const form = document.querySelector("form");
const captchaTitle = "Captcha Component Prototype 1.2";

class CaptchaComponent extends HTMLElement {
    constructor() {
        super();
        const shadow = this.attachShadow({ mode: 'open' });

        const wrapper = document.createElement('div');
        wrapper.classList.add('captcha-wrapper');
        const style = document.createElement('style');
        this.counter = 3;
        style.textContent = /* CSS */` 

    :host{
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1000;
        width: var(--captcha-width, 100%);
        height: 100%;
        overflow: hidden;
        backdrop-filter: blur(10px);
    }
    * {
        padding: 0;
        margin: 0;
    }
    
    .captcha-wrapper{
        height: 100%;
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        
    }
    .captcha-container {
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        max-width: 41em;
        width: auto;
        display: flex;
        flex-direction: column;
        background-color: white;
        border-radius: 0.6em;
        padding: 3%;
        text-align: center;
        box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.5);
        animation: fadeIn 0.5s ease-in;
        justify-content: center;
        align-items: center;
    }
    
    
    .captchta-canvas > * {
        grid-column: 1;
        grid-row: 1;
    
    }
    
    .captchta-canvas {
        width: max-content;
        display: grid;
        grid-template-columns: 1fr;
        grid-template-rows: 1fr;
        margin: 0 auto;
        max-width: 100%;
        align-items: end;
        overflow: overlay;
        max-height: 90vh;
    }
    
    .cube {
        cursor: crosshair;
    }
    .cube:hover {
        background-color: red;
        opacity: 0.5;
    }
    .cube.selected {
        background-color: yellow;
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    
    .title {
        font-size: x-large;
        margin-bottom: 20px;
        color: #000000;
    }
    
    .canvas {
        display: grid;
        grid-template-columns: repeat(31, 1em); 
        grid-template-rows: repeat(31, 1em); 
        border: 3px solid black;
        border-radius: 5px;
        max-width: 100%; 
        width: fit-content;
        background-position: center;
        background-size: 70%;
        background-repeat: no-repeat;
    
    }
    
    .canvas > * {
        border: 1px  black;
        box-sizing: border-box;
    }
    
    .controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        width: 100%;
        margin-top: 20px;
    }
    button {
        padding: 10px 20px;
        margin: 5px;
        font-size: 16px;
        cursor: pointer;
        background-color: #007BFF;
        color: white;
        border: none;
        border-radius: 3px;
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .submit-button{
        width: 80%;
    }
    .reset-button{
        width: 20%;
    }
    
    button:hover {
        background-color: #0056b3;
    }
    
    svg {
        width: 20px;
        height: 20px;
        margin-right: 5px;
    }

    .close-button {
        position: absolute;
        top: 0;
        right: 0.5em;
        cursor: pointer;
        background: none;
        border: none;
        font-size: 2em;
        color: white;
        border-radius: 100%;
    }

    .background-pattern {
        position: relative;
        width: fit-content;
        height: fit-content;
    }

    button .close-button:hover{
        background-color: transparent;
    }
    
    @media screen and (max-width: 676px){
      
        .canvas {
            grid-template-columns: repeat(31, 0.7em) !important;
            grid-template-rows: repeat(31, 0.7em) !important;
        }
        .title{
            font-size: large;
        }
        .submit-button {
            height: 2em;
        }
        .reset-button {
            height: 2em;
        }
    
    }
    
    @media screen and (max-width: 400px){
        .captcha-container{
            max-width: 39em;
            padding: 4%;
        }
    
        .canvas {
            grid-template-columns: repeat(31, 0.65em) !important;
            grid-template-rows: repeat(31, 0.65em) !important;
        }
    
    }
        `;

        const template = document.createElement('template');
        template.innerHTML = /* HTML */ `
        <div class="captcha-container">
        <div class="close-button">×</div> 
        <h1 class="title">${captchaTitle}</h1>
        <div class="captchta-canvas">
            <div class="background-pattern">
                <div class="canvas"></div>
            </div>
        </div>
        <div class="controls">
            <button class="reset-button">
                <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 489.645 489.645" xml:space="preserve" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path d="M460.656,132.911c-58.7-122.1-212.2-166.5-331.8-104.1c-9.4,5.2-13.5,16.6-8.3,27c5.2,9.4,16.6,13.5,27,8.3 c99.9-52,227.4-14.9,276.7,86.3c65.4,134.3-19,236.7-87.4,274.6c-93.1,51.7-211.2,17.4-267.6-70.7l69.3,14.5 c10.4,2.1,21.8-4.2,23.9-15.6c2.1-10.4-4.2-21.8-15.6-23.9l-122.8-25c-20.6-2-25,16.6-23.9,22.9l15.6,123.8 c1,10.4,9.4,17.7,19.8,17.7c12.8,0,20.8-12.5,19.8-23.9l-6-50.5c57.4,70.8,170.3,131.2,307.4,68.2 C414.856,432.511,548.256,314.811,460.656,132.911z"></path> </g> </g></svg>
            </button>
            <button class="submit-button">Submit</button>
        </div>
    </div>
        `;

        shadow.appendChild(style);
        shadow.appendChild(wrapper);
        wrapper.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
        const exitButton = this.shadowRoot.querySelector(".close-button").addEventListener("click", () => removeCaptcha());

        this.initialize();
        this.captchaTitle = this.shadowRoot.querySelector(".title");
        const resetButton = this.shadowRoot.querySelector('.reset-button');
        const submitButton = this.shadowRoot.querySelector('.submit-button');
        this.captchaContainer = this.shadowRoot.querySelector(".captcha-container")
        this.captchaCanvas = this.shadowRoot.querySelector(".canvas")

        let mouseIsDown = false
        let fingerIsDown = false
        let drawFingerEventListener;

        this.captchaCanvas.addEventListener('touchstart', event => {
            fingerIsDown = true
            drawFingerEventListener(event, true)
        })


        this.captchaCanvas.addEventListener('touchend', event => {
            fingerIsDown = false;
        });

        this.shadowRoot.querySelector('.canvas').addEventListener('touchmove', drawFingerEventListener = (event, toggle = false) => {
            event.preventDefault();
            if (fingerIsDown) {
                const touch = event.touches[0];
                if (touch) {
                    const targetElement = this.shadowRoot.elementFromPoint(touch.clientX, touch.clientY);
                    if (targetElement && targetElement.classList.contains("cube")) {
                        targetElement.classList[toggle ? "toggle" : "add"]("selected");
                    }
                }
            }
        });
        this.addEventListener('mousedown', event => {
            mouseIsDown = true
            drawEventListener(event, true)
        })
        this.addEventListener('mouseup', event => (mouseIsDown = false))
        let drawEventListener
        this.shadowRoot.querySelector('.canvas').addEventListener('mouseover', drawEventListener = (event, toggle = false) => {
            event.preventDefault()
            if (mouseIsDown) {
                const firstElement = event.composedPath()[0]
                if (firstElement.classList.contains("cube")) {
                    firstElement.classList[toggle ? "toggle" : "add"]("selected")
                }
            }
        })

        resetButton.addEventListener('click', this.reset.bind(this));
        submitButton.addEventListener('click', this.submit.bind(this));

    }

    async initialize() {
        this.siteReload();
        this.buildCubes();
        await this.pullImage();

    }


    buildCubes() {
        const canvas = this.shadowRoot.querySelector('.canvas');
        const numbCubes = 961;
        for (let i = 1; i < numbCubes; i++) {
            const cube = document.createElement('div');
            cube.classList.add('cube');
            cube.setAttribute('id', i);
            canvas.appendChild(cube);
        }
    }
    captchaFailed() {
        this.counter -= 1;
        if (this.counter > 0) {
            this.resetCaptcha();
            if (this.counter > 1) {
                this.captchaTitle.innerHTML = `Captcha failed ` + this.counter + ` Trys left!`;
            } else {
                this.captchaTitle.innerHTML = `Captcha failed ` + this.counter + ` Try left!`;
            }

        } else {
            location.reload();
        }
    }

    async resetCaptcha() {
        await this.pullImage();
        this.reset()
    }

    async pullImage() {
        try {
            await fetch(`/getImage`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Error in server request.');
                }
            })
            .then(data => {
                if (data.clientData) {
                    console.log(data)
                    this.clientData = data.clientData;
                    const backgroundImageUrl = data.finishedURL;
                    const background = this.shadowRoot.querySelector('.canvas');
                    background.style.backgroundImage = `url(${backgroundImageUrl})`;
    
                } else {
                    throw new Error('Error in server request.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('An error occurred. Please try again later.');
            });
    
        } catch (error) {
            console.error('Error:', error);
            console.log('An error occurred. Please try again later.');
        }
    }


    reset() {
        const cubes = this.shadowRoot.querySelectorAll('.cube');
        cubes.forEach(cube => {
            if (cube.classList.contains('selected')) {
                cube.classList.remove('selected');
            }
        });
    }

    siteReload() {
        console.log("reload")
        fetch('/reload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Fehler bei der Serveranfrage.');
                }
            })
            .catch(error => {
                console.error('Fehler:', error);
            });
    }

    submit() {
        const selectedCubes = Array.from(this.shadowRoot.querySelectorAll('.cube')).filter(cube => cube.classList.contains('selected'));
        const selectedIds = selectedCubes.map(cube => cube.id);
        const countFields = this.shadowRoot.querySelector('.canvas').childElementCount;
        console.log("selectedids", selectedIds)
        console.log("clientdata:", this.clientData)

        fetch('/checkCubes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ selectedIds: selectedIds, clientData: this.clientData })
        })
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Fehler bei der Serveranfrage.');
                }
            })
            .then(data => {
                if (data.isValid) {
                    alert("Validierung erfolgreich!");
                    var valid = true;
                    checkIfBot(data.isValid);

                } else {
                    alert("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Auswahl.");
                    checkIfBot(data.isValid);

                }
            })
            .catch(error => {
                console.error('Fehler:', error);
                alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            });

    }

}


customElements.define('captcha-component', CaptchaComponent);

function displayCaptcha() {
    captchaComponent.style.display = 'block';
    const captchaWrapper = captchaComponent.shadowRoot.querySelector('.captcha-wrapper');
    captchaWrapper.style.opacity = '1';
    document.body.style.overflow = 'hidden';
    return false;
}


function removeCaptcha() {
    const captchaWrapper = captchaComponent.shadowRoot.querySelector('.captcha-wrapper');
    captchaWrapper.style.transition = 'opacity 0.5s ease-in-out';
    captchaWrapper.style.opacity = '0';
    document.body.style.overflow = '';

    setTimeout(() => {
        captchaComponent.style.display = 'none';
    }, 500);
}


async function checkIfBot(data) {
    if (data != null) {
        if (data == true) {
            removeCaptcha();

            const usernameInput = document.getElementById('Log-In-Form-7-Email');
            const passwordInput = document.getElementById('Log-In-Form-7-Password');

            const username = usernameInput.value;
            const password = passwordInput.value;

            await submitForm(username, password);
        } else {
            captchaComponent.captchaFailed();
        }
    }
}

async function submitForm(username, password) {
    const form = document.getElementById('wf-form-Log-in-Form-7');


    form.submit();
}


