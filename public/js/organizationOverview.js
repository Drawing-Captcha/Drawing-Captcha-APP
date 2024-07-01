document.addEventListener("DOMContentLoaded", initialize);

let dialog = document.getElementById('changeDetailsDialog');
let closeButton = document.getElementById('close');
let imageUpload = document.getElementById('imageUpload');
let profileImage = document.getElementById('profileImage');
let usernameInput = dialog.querySelector("#username");
let emailInput = dialog.querySelector("#email");
let passwordInput = dialog.querySelector("#password");
let retypePasswordInput = document.querySelector(".retype-password input");
let elementID;
let ownUser;
const roleSelect = document.getElementById('role');
const changeForm = document.querySelector("#changeDetailsForm")
const selectBtn = document.querySelector(".select-btn")
const companyAccessField = document.querySelector(".companyAccess")
let items;
selectBtn.addEventListener("click", () => {
    selectBtn.classList.toggle("open");
});

function closeSelectBtn() {
    if (selectBtn.classList.contains("open")) {
        selectBtn.classList.remove("open");
    }
}
imageUpload.addEventListener('change', function () {
    let reader = new FileReader();
    reader.onload = function (e) {
        profileImage.src = e.target.result;
    }
    reader.readAsDataURL(this.files[0]);
});

async function initialize() {
    await getAllUser();
    await getCompanies();

}

async function getAllUser() {
    try {
        const response = await fetch("/user/allUsers", {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
        });
        if (response.ok) {
            const data = await response.json();
            const allUser = data.allUsers;
            ownUser = data.ownUser;

            const wrapper = document.querySelector(".stacked-list1_list-wrapper");

            if (allUser.length !== 0) {
                allUser.forEach(elementData => {
                    const item = document.createElement("div");
                    item.classList.add("stacked-list1_item");

                    const avatar = document.createElement("div");
                    avatar.classList.add("stacked-list1_avatar");

                    const avatarImageWrapper = document.createElement("div");
                    avatarImageWrapper.classList.add("stacked-list1_avatar-image-wrapper");

                    const img = document.createElement("img");
                    img.src = elementData.ppURL ? elementData.ppURL : "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";
                    img.loading = "lazy";
                    img.alt = elementData.username;
                    img.classList.add("stacked-list1_avatar-image");
                    avatarImageWrapper.appendChild(img);

                    const maxwidthLarge = document.createElement("div");
                    maxwidthLarge.classList.add("max-width-large");

                    const itemName = document.createElement("div");
                    itemName.classList.add("text-weight-semibold");
                    itemName.textContent = elementData.username;

                    const userEmail = document.createElement("div");
                    userEmail.classList.add("text-weight-light");
                    userEmail.textContent = elementData.email;

                    maxwidthLarge.appendChild(itemName);
                    maxwidthLarge.appendChild(userEmail);

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
                    deleteButton.addEventListener("click", () => deleteUser(elementData));

                    const returnButton = document.createElement("button");
                    returnButton.classList.add("iconButton", "is-icon-only");
                    returnButton.innerHTML = `<!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                    <svg fill="#ffffff" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="800px" height="800px" viewBox="0 0 494.936 494.936" xml:space="preserve" stroke="#ffffff">
                    
                    <g id="SVGRepo_bgCarrier" stroke-width="0"/>
                    
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"/>
                    
                    <g id="SVGRepo_iconCarrier"> <g> <g> <path d="M389.844,182.85c-6.743,0-12.21,5.467-12.21,12.21v222.968c0,23.562-19.174,42.735-42.736,42.735H67.157 c-23.562,0-42.736-19.174-42.736-42.735V150.285c0-23.562,19.174-42.735,42.736-42.735h267.741c6.743,0,12.21-5.467,12.21-12.21 s-5.467-12.21-12.21-12.21H67.157C30.126,83.13,0,113.255,0,150.285v267.743c0,37.029,30.126,67.155,67.157,67.155h267.741 c37.03,0,67.156-30.126,67.156-67.155V195.061C402.054,188.318,396.587,182.85,389.844,182.85z"/> <path d="M483.876,20.791c-14.72-14.72-38.669-14.714-53.377,0L221.352,229.944c-0.28,0.28-3.434,3.559-4.251,5.396l-28.963,65.069 c-2.057,4.619-1.056,10.027,2.521,13.6c2.337,2.336,5.461,3.576,8.639,3.576c1.675,0,3.362-0.346,4.96-1.057l65.07-28.963 c1.83-0.815,5.114-3.97,5.396-4.25L483.876,74.169c7.131-7.131,11.06-16.61,11.06-26.692 C494.936,37.396,491.007,27.915,483.876,20.791z M466.61,56.897L257.457,266.05c-0.035,0.036-0.055,0.078-0.089,0.107 l-33.989,15.131L238.51,247.3c0.03-0.036,0.071-0.055,0.107-0.09L447.765,38.058c5.038-5.039,13.819-5.033,18.846,0.005 c2.518,2.51,3.905,5.855,3.905,9.414C470.516,51.036,469.127,54.38,466.61,56.897z"/> </g> </g> </g>
                    
                    </svg>`;
                    returnButton.addEventListener("click", () => changeDetails(elementData));
                    if (ownUser.role === "admin" || ownUser._id === elementData._id) {
                        if (!elementData.initialUser) {
                            droppDownToggle.appendChild(deleteButton);
                        }
                        droppDownToggle.appendChild(returnButton);
                    }
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapper.appendChild(item);
                });
            } else {
                const syncWrapper = document.createElement("div");
                syncWrapper.classList.add("syncWrapper");

                syncWrapper.addEventListener("click", () => window.location.reload());
                syncWrapper.style.cursor = "pointer";

                const syncMessage = document.createElement("h3");
                syncMessage.innerHTML = "No items in pool currently, sync here.. 🤔🔄";

                wrapper.appendChild(syncWrapper);
                syncWrapper.appendChild(syncMessage);
            }
        } else {
            throw new Error('Error server while trying to request the server');
        }
    } catch (error) {
        console.log(error);
    }
}

async function getCompanies() {
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
                items = document.querySelectorAll(".item");

                items.forEach(item => {
                    item.addEventListener("click", () => {
                        item.classList.toggle("checked");

                        let checked = document.querySelectorAll(".checked"),
                            btnText = document.querySelector(".btn-text");

                        if (checked && checked.length > 0) {
                            btnText.innerText = `${checked.length} Selected`;
                        } else {
                            btnText.innerText = "Select Company";
                        }
                    });
                })
            }
        } else {
            throw new Error('Error from server while trying to request the server');
        }
    } catch (error) {
        console.log('Error in getCompanies:', error);
    }
}


function resetCheckboxes() {
    let items = document.querySelectorAll(".item");
    items.forEach(item => {
        item.classList.remove("checked");
    })
}


async function changeDetails(e) {
    dialog.showModal();
    closeSelectBtn();
    resetCheckboxes();
    let items = document.querySelectorAll(".item")
    let btnText = document.querySelector(".btn-text")
    let counter = 0;
    items.forEach(item => {
        if (e.companies.includes(item.getAttribute("obj-id"))) {
            counter++;
            console.log(counter)
            item.classList.add("checked")
        }
    })

    if (counter > 0) {
        btnText.innerHTML = counter + " Selected"
    }
    else{
        btnText.innerHTML = "Select Company"
    }

    if(ownUser.role === "admin" && e.role != "admin"){
        companyAccessField.style.display = "block"
    }
    else{
        companyAccessField.style.display = "none"

    }
    if (ownUser.role === "admin") {

        if (!e.initialUser) {
            roleSelect.parentElement.style.display = "block";
            roleSelect.value = e.role;
        }
        else {
            roleSelect.parentElement.style.display = "none";
        }
    } else {
        roleSelect.parentElement.style.display = "none";
    }

    retypePasswordInput.parentElement.style.display = "none";
    retypePasswordInput.value = "";

    profileImage.src = e.ppURL ? e.ppURL : "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg";
    usernameInput.value = e.username;
    emailInput.value = e.email;

    passwordInput.value = "";
    retypePasswordInput.value = "";

    elementID = e._id;
}

function submitForm(event) {
    event.preventDefault();

    if (passwordInput.value) {
        if (passwordInput.value.length < 5 || passwordInput.value !== retypePasswordInput.value) {
            alert("Passwords do not match or are too short (Min 5 Characters). Please retype the password.");
            return;
        }
    }

    if (!confirm("Are you sure you want to change your details?")) {
        return;
    }

    let shouldChangePassword = false;
    let password = "";

    if (passwordInput.value && passwordInput.value === retypePasswordInput.value) {
        shouldChangePassword = true;
        password = passwordInput.value;
    }

    const selectorItems = dialog.querySelectorAll(".item")
    let selectorItemsArray = []
    selectorItems.forEach(item => {
        if (item.classList.contains("checked")) {
            selectorItemsArray.push(item.getAttribute("obj-id"))
        }
    })


    const submittedData = {
        id: elementID,
        username: usernameInput.value,
        email: emailInput.value,
        ppURL: profileImage.src,
        shouldChangePassword,
        password: password,
        role: roleSelect.value,
        companies: selectorItemsArray
    };

    fetch("/user/updateUser", {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ submittedData })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                return response.json().then(errData => {
                    throw new Error(errData.message || 'Error server while trying to request the server');
                });
            }
        })
        .then(data => {
            alert('User updated successfully');
            location.reload();
        })
        .catch(error => {
            console.error('Fehler:', error);
            alert(`An error occurred: ${error.message}`);
        });


    dialog.close();
}

closeButton.addEventListener('click', () => {
    dialog.close();
});

passwordInput.addEventListener("input", () => {
    if (passwordInput.value) {
        retypePasswordInput.parentElement.style.display = "block";
    } else {
        retypePasswordInput.parentElement.style.display = "none";
        retypePasswordInput.value = "";
    }
});


function deleteUser(user) {
    if (!confirm("Are you sure you want to delete the User: " + user.username + "?")) {
        return;
    }
    fetch("/user/deleteUser", {
        method: "DELETE",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ user })
    })
        .then(response => {
            return response.json().then(data => {
                if (data.message) {
                    alert(data.message);
                }
                if (data.redirect) {
                    window.location.href = data.redirect;
                }
                location.reload();
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred: ${error.message}`);
        });
}




document.getElementById('changeDetailsForm').addEventListener('submit', submitForm);
