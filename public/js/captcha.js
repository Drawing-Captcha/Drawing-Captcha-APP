function initializeCaptcha(formsWithCaptcha) {
    document.body.appendChild(document.createElement("captcha-component"));
    const captchaComponent = document.querySelector("captcha-component");
    if (formsWithCaptcha?.tagName !== 'FORM') formsWithCaptcha = Array.from(document.querySelectorAll('form[drawing-captcha]'));
    if (!Array.isArray(formsWithCaptcha)) formsWithCaptcha = [formsWithCaptcha]

    formsWithCaptcha.forEach(form => {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            captchaComponent.displayCaptchaAndSubmit(form);
        })
    })
}

class CaptchaComponent extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.captchaValidated = false;
        this.counter = 3;
    }


    connectedCallback() {
        if (this.shouldRenderCSS()) this.renderCSS()
        if (this.shouldRenderHTML()) {
            this.renderHTML()
            this.initialize();
            let title = this.shadowRoot.querySelector('.title')
            this.getAssets().then(() => {
  
            })
            this.getColorKit().then(() => {
                title.textContent = this.captchaTitle
                this.customStyle.textContent += /* CSS */`
                    :host {
                        --drawing-captcha-cube-hovering-color: ${this.cubeHoverColor};
                        --drawing-captcha-cube-selected-color: ${this.selectedCubesColor};
                        --drawing-captcha-button-background-color: ${this.buttonColor};
                        --drawing-captcha-button-hover-background-color: ${this.buttonHoverColor};
                    }
                `
            });
        }
        console.log("Drawing-Captcha Connected")
        this.shadowRoot.querySelector(".close-button").addEventListener("click", () => this.removeCaptcha());
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

        this.resetButton.addEventListener('click', this.reset.bind(this));
        submitButton.addEventListener('click', this.submit.bind(this));

    }

    disconnectedCallback() {
        const forms = document.querySelectorAll('form[drawing-captcha]');
        forms.forEach(form => {
            form.removeEventListener("submit", this.captchaSubmitHandler);
        });
        const captchaCanvas = this.shadowRoot.querySelector(".canvas");
        captchaCanvas.removeEventListener('touchstart', this.drawFingerEventListener);
        captchaCanvas.removeEventListener('touchend', () => (this.fingerIsDown = false));
        captchaCanvas.removeEventListener('touchmove', this.drawFingerEventListener);

        this.shadowRoot.querySelector('.canvas').removeEventListener('mouseover', this.drawEventListener);

        this.resetButton.removeEventListener('click', this.reset);

        const submitButton = this.shadowRoot.querySelector('.submit-button');
        submitButton.removeEventListener('click', this.submit);

        const exitButton = this.shadowRoot.querySelector(".close-button");
        exitButton.removeEventListener("click", this.removeCaptcha);

    }

    shouldRenderCSS() {
        return !this.shadowRoot.querySelector('style')
    }

    shouldRenderHTML() {
        return !this.shadowRoot.querySelector('.captcha-wrapper')
    }

    renderCSS() {
        this.customStyle = document.createElement('style')
        this.customStyle.textContent = /* CSS */` 
            * {
                padding: var(--drawing-captcha-universal-padding, 0);
                margin: var(--drawing-captcha-universal-margin, 0);
            }
        
            dialog {
                width: var(--drawing-captcha-dialog-width, 100%);
                max-width: var(--drawing-captcha-dialog-max-width, -webkit-fill-available);
                max-height: var(--drawing-captcha-dialog-max-height, -webkit-fill-available);
                height: var(--drawing-captcha-dialog-height, 100%);
                background: var(--drawing-captcha-dialog-background, none);
                border: var(--drawing-captcha-dialog-border, none);
            }
            
            .captcha-wrapper {
                width: var(--drawing-captcha-wrapper-width, 100%);
                height: var(--drawing-captcha-wrapper-height, 100%);
                display: flex;
                justify-content: center;
                align-items: center;
            }
            
            .captcha-container {
                color: var(--drawing-captcha-container-color, white);
                font-family: var(--drawing-captcha-container-font, Arial, Helvetica, sans-serif);
                max-width: var(--drawing-captcha-container-max-width, 32em);
                width: var(--drawing-captcha-container-width, auto);
                display: flex;
                flex-direction: column;
                background-color: var(--drawing-captcha-container-background-color, white);
                border-radius: var(--drawing-captcha-container-border-radius, 0.6em);
                padding: var(--drawing-captcha-container-padding, 2em);
                text-align: var(--drawing-captcha-container-text-align, center);
                box-shadow: var(--drawing-captcha-container-box-shadow, 0px 0px 10px rgba(0, 0, 0, 0.5));
                animation: var(--drawing-captcha-container-animation, fadeIn 0.5s ease-in);
                justify-content: center;
                align-items: center;
            }
            
            .captchta-canvas {
                width: var(--drawing-captcha-captchta-canvas-width, max-content);
                display: grid;
                grid-template-columns: var(--drawing-captcha-captchta-canvas-grid-columns, 1fr);
                grid-template-rows: var(--drawing-captcha-captchta-canvas-grid-rows, 1fr);
                margin: var(--drawing-captcha-captchta-canvas-margin, 0 auto);
                max-width: var(--drawing-captcha-captchta-canvas-max-width, 100%);
                align-items: var(--drawing-captcha-captchta-canvas-align-items, end);
                overflow: var(--drawing-captcha-captchta-canvas-overflow, overlay);
                max-height: var(--drawing-captcha-captchta-canvas-max-height, 90vh);
            }
            
            .cube {
                cursor: var(--drawing-captcha-cube-cursor, crosshair);
            }
            
            .cube:hover {
                background-color: var(--drawing-captcha-cube-hovering-color, ${this.cubeHoverColor});
                opacity: var(--drawing-captcha-cube-hovering-opacity, 0.5);
            }
            
            .cube.selected {
                background-color: var(--drawing-captcha-cube-selected-color, ${this.selectedCubesColor});
            }
            
            .title {
                font-size: var(--drawing-captcha-title-font-size, x-large);
                margin-bottom: var(--drawing-captcha-title-margin-bottom, 20px);
                color: var(--drawing-captcha-title-color, #000000);
            }
            
            .canvas {
                display: grid;
                grid-template-columns: var(--drawing-captcha-canvas-grid-columns, repeat(31, 1em));
                grid-template-rows: var(--drawing-captcha-canvas-grid-rows, repeat(31, 1em));
                border: var(--drawing-captcha-canvas-border, 3px solid black);
                border-radius: var(--drawing-captcha-canvas-border-radius, 5px);
                max-width: var(--drawing-captcha-canvas-max-width, 100%);
                width: var(--drawing-captcha-canvas-width, fit-content);
                background-position: var(--drawing-captcha-canvas-background-position, center);
                background-size: var(--drawing-captcha-canvas-background-size, 70%);
                background-repeat: var(--drawing-captcha-canvas-background-repeat, no-repeat);
            }
            
            .canvas > * {
                border: var(--drawing-captcha-canvas-child-border, 1px black);
                box-sizing: var(--drawing-captcha-canvas-child-box-sizing, border-box);
            }
            
            .controls {
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                width: var(--drawing-captcha-controls-width, 100%);
                margin-top: var(--drawing-captcha-controls-margin-top, 20px);
            }
            
            button {
                padding: var(--drawing-captcha-button-padding, 10px 20px);
                margin: var(--drawing-captcha-button-margin, 5px);
                font-size: var(--drawing-captcha-button-font-size, 16px);
                cursor: var(--drawing-captcha-button-cursor, pointer);
                background-color: var(--drawing-captcha-button-background-color, ${this.buttonColor});
                color: var(--drawing-captcha-button-color, white);
                border: var(--drawing-captcha-button-border, none);
                border-radius: var(--drawing-captcha-button-border-radius, 3px);
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .submit-button {
                width: var(--drawing-captcha-submit-button-width, 80%);
            }
            
            .reset-button {
                width: var(--drawing-captcha-reset-button-width, 20%);
            }
            
            button:hover {
                background-color: var(--drawing-captcha-button-hover-background-color, ${this.buttonHoverColor});
            }
            
            svg {
                width: var(--drawing-captcha-svg-width, 20px);
                height: var(--drawing-captcha-svg-height, 20px);
                margin-right: var(--drawing-captcha-svg-margin-right, 5px);
            }
            
            .close-button {
                position: absolute;
                top: var(--drawing-captcha-close-button-top, 0);
                right: var(--drawing-captcha-close-button-right, 0.5em);
                cursor: pointer;
                background: var(--drawing-captcha-close-button-background, none);
                border: var(--drawing-captcha-close-button-border, none);
                font-size: var(--drawing-captcha-close-button-font-size, 2em);
                color: var(--drawing-captcha-close-button-color, white);
                border-radius: var(--drawing-captcha-close-button-border-radius, 100%);
            }
            
            .background-pattern {
                position: relative;
                width: var(--drawing-captcha-background-pattern-width, fit-content);
                height: var(--drawing-captcha-background-pattern-height, fit-content);
            }
            
            button .close-button:hover {
                background-color: var(--drawing-captcha-close-button-hover-background-color, transparent);
            }
            
            @media screen and (max-width: 676px) {
                .canvas {
                    grid-template-columns: var(--drawing-captcha-canvas-small-grid-columns, repeat(31, 0.7em)) !important;
                    grid-template-rows: var(--drawing-captcha-canvas-small-grid-rows, repeat(31, 0.7em)) !important;
                }
            
                .title {
                    font-size: var(--drawing-captcha-title-small-font-size, large);
                }
            
                .submit-button {
                    height: var(--drawing-captcha-submit-button-small-height, 2em);
                }
            
                .reset-button {
                    height: var(--drawing-captcha-reset-button-small-height, 2em);
                }
            }
            
            @media screen and (max-width: 500px) {
                .captcha-container {
                    max-width: var(--drawing-captcha-captcha-container-max-width-small, 39em);
                    padding: var(--drawing-captcha-captcha-container-padding-small, 4%);
                    margin: var(--drawing-captcha-captcha-container-margin-small, 1em);

                }
            
                .canvas {
                    grid-template-columns: var(--drawing-captcha-canvas-small-grid-columns, repeat(31, 0.65em)) !important;
                    grid-template-rows: var(--drawing-captcha-canvas-small-grid-rows, repeat(31, 0.65em)) !important;
                }
            }
        `;
    }

    renderHTML() {
        this.dialog = document.createElement('dialog');
        const template = document.createElement('template');
        template.innerHTML = /* HTML */ `
        <div class="captcha-wrapper">
        <div class="captcha-container">
        <div class="close-button">×</div>
        <h1 class="title">Loading...</h1>
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
    </div>

        `;
        this.shadowRoot.appendChild(this.customStyle);
        this.shadowRoot.appendChild(this.dialog);
        this.dialog.appendChild(template.content.cloneNode(true));
    }

    async initialize() {
        await this.siteReload();
        this.buildCubes();
    }


    displayCaptcha() {
        console.log("display")
        this.dialog.showModal();
    }

    removeCaptcha() {
        console.log("close")
        this.dialog.close();
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
        await this.getAssets();
        this.reset()
    }
    async getAssets() {
        try {
            const response = await fetch(`/getImage`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.clientData) {
                    this.clientData = data.clientData;
                    this.assets = data
                    const backgroundImageUrl = this.assets.finishedURL;
                    const background = this.captchaCanvas;
                    background.style.backgroundImage = `url(${backgroundImageUrl})`;
                } else {
                    throw new Error('Error in server response: Missing client data.');
                }
            } else {
                const errorMessage = await response.json();
                throw new Error(`Server error: ${errorMessage.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
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

    async siteReload() {
        fetch(`/reload`, {
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

    async getColorKit() {
        try {
            const response = await fetch(`/captchaSettings`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch color kit data');
            }

            const data = await response.json();
            if (data && data.returnedColorKit) {
                let returnedColorKit = data.returnedColorKit;
                this.colorKit = returnedColorKit
                await this.applyColorKitStylings()

            } else {
                throw new Error('Invalid color kit data format');
            }
        } catch (error) {
            console.error('Error fetching color kit:', error);
        }
    }

    async applyColorKitStylings() {
        this.captchaTitle = this.colorKit.defaultTitle ? this.colorKit.defaultTitle : "Testing Verison"
        this.buttonColor = this.colorKit.buttonColorValue ? this.colorKit.buttonColorValue : "#007BFF"
        this.buttonHoverColor = this.colorKit.buttonColorHoverValue ? this.colorKit.buttonColorHoverValue : "#0056b3"
        this.selectedCubesColor = this.colorKit.selectedCubeColorValue ? this.colorKit.selectedCubeColorValue : "yellow"
        this.cubeHoverColor = this.colorKit.canvasOnHoverColorValue ? this.colorKit.canvasOnHoverColorValue : "red"
    }


    submit() {
        const selectedCubes = Array.from(this.shadowRoot.querySelectorAll('.cube')).filter(cube => cube.classList.contains('selected'));
        const selectedIds = selectedCubes.map(cube => cube.id);
        const countFields = this.shadowRoot.querySelector('.canvas').childElementCount;
        console.log("selectedids", selectedIds)
        console.log("clientdata:", this.clientData)

        fetch(`/checkCubes`, {
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
                    this.validateCaptcha(data.isValid);

                } else {
                    alert("Validierung fehlgeschlagen. Bitte überprüfen Sie Ihre Auswahl.");
                    this.validateCaptcha(data.isValid);

                }
            })
            .catch(error => {
                console.error('Fehler:', error);
                alert('Es ist ein Fehler aufgetreten. Bitte versuchen Sie es später erneut.');
            });

    }

    displayCaptchaAndSubmit(form) {
        if (!this.captchaValidated) {
            this.displayCaptcha();
            this.addEventListener("captchaValidated", function () {
                this.captchaValidated = true;
                form.submit();
            }, { once: true });
        } else {
            form.submit();
        }
    }

    async validateCaptcha(data) {
        if (data != null) {
            if (data) {
                this.removeCaptcha();
                const captchaEvent = new Event("captchaValidated");
                this.captchaValidated = true;
                this.dispatchEvent(captchaEvent);

            } else {
                this.captchaFailed();
            }
        }
    }

    get resetButton() {
        return this.shadowRoot.querySelector('.reset-button')
    }
}

customElements.define('captcha-component', CaptchaComponent);