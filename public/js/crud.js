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
                editButton.innerHTML = `<svg fill="#000000" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" 
                width="24" height="24" viewBox="0 0 494.936 494.936"
                xml:space="preserve">
           <g>
               <g>
                   <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157
                       c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21
                       s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741
                       c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"/>
                   <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069
                       c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963
                       c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692
                       C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107
                       l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005
                       c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z"/>
               </g>
           </g>
           </svg>`;
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

function pushToServer() {
    fetch("/crud", {
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
                throw new Error('Fehler bei der Serveranfrage.');
            }
        })
        .then(data => {
            if (data.isGood) {
                alert("Änderungen Erfolgreich am CRUD durchgenommen!")
                location.reload()
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