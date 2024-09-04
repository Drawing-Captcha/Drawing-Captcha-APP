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
    await buildCompanyShells();
    await buildEditCompanies();

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

            let wrapper
            const shells = document.querySelectorAll(".section_shell2-layout")
            const userWithoutCompanyShell = document.querySelector(".noCompanyShell")

            if (allUser.length !== 0) {
                allUser.forEach(elementData => {
                    if (elementData.appAdmin) {
                        shells.forEach(shell => {
                            if (shell.classList.contains("appAdmin")) {
                                wrapper = shell.querySelector(".stacked-list1_list-wrapper");
                            }
                        });
                        wrapper = document.querySelector(".stacked-list1_list-wrapper");
                    }
                    else {
                        if (elementData.company && elementData.role === "admin") {
                            shells.forEach(shell => {
                                if (elementData.company === shell.getAttribute("companyid") && shell.classList.contains("companyAdmin")) {
                                    wrapper = shell.querySelector(".stacked-list1_list-wrapper")
                                }
                            })
                        }
                        else {
                            if (elementData.company) {
                                shells.forEach(shell => {
                                    if (elementData.company === shell.getAttribute("companyid")) {
                                        wrapper = shell.querySelector(".stacked-list1_list-wrapper")
                                    }
                                })
                            }
                            else {
                                wrapper = userWithoutCompanyShell.querySelector(".stacked-list1_list-wrapper")
                            }
                        }

                    }
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
                        if (!elementData.initialUser) {
                            droppDownToggle.appendChild(returnButton);
                        }
                    }
                    dropdownComponent.appendChild(droppDownToggle);
                    contentRight.appendChild(dropdownComponent);
                    item.appendChild(avatar);
                    item.appendChild(contentRight);
                    wrapper.appendChild(item);
                });
            }

            await addSyncMessage(shells, "users")

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
            return data

        } else {
            throw new Error('Error from server while trying to request the server');
        }
    } catch (error) {
        console.log('Error in getCompanies:', error);
    }
}

async function buildEditCompanies() {
    let data = await getCompanies();
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
        let btnText = document.querySelector(".btn-text")
        let checked
        items.forEach(item => {
            item.addEventListener("click", () => {
                if (item.classList.contains("checked")) {
                    removeCheck(item)
                    checked = "";
                }
                else {
                    removeCheck()
                    checked = item.querySelector(".item-text").innerText
                    item.classList.toggle("checked");
                }
                
            if (checked && checked.length > 0) {
                btnText.innerText = `${checked} selected`;
            } else {
                btnText.innerText = "No company selected";
            }
            })
        })
    }
}

function resetCheckboxes() {
    let items = document.querySelectorAll(".item");
    items.forEach(item => {
        item.classList.remove("checked");
    })
}


async function changeDetails(e) {
    let allCompaniesData = await getCompanies();
    let elementCompany = allCompaniesData.allCompanies.find(company => e.company === company.companyId);
    dialog.showModal();
    closeSelectBtn();
    resetCheckboxes();
    let items = document.querySelectorAll(".item")
    let btnText = document.querySelector(".btn-text")
    btnText.innerHTML = "No company selected"
    items.forEach(item => {
        if (e.company === item.getAttribute("obj-id")) {
            btnText.innerHTML = elementCompany.name + " Selected"
            item.classList.add("checked")
        }
    })

    let appAdminCheckbox = dialog.querySelector(".switch input[type='checkbox']");
    if(appAdminCheckbox){
        appAdminCheckbox.checked = e.appAdmin;
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
    let selectorItem
    selectorItems.forEach(item => {
        if (item.classList.contains("checked")) {
            selectorItem = item.getAttribute("obj-id")
        }
    })

    let appAdminCheckbox = dialog.querySelector(".switch input[type='checkbox']");
    let appAdmin
    if(appAdminCheckbox){
        appAdmin = appAdminCheckbox.checked
    }
    else{
        appAdmin = false
    }

    const submittedData = {
        id: elementID,
        username: usernameInput.value,
        email: emailInput.value,
        ppURL: profileImage.src,
        shouldChangePassword,
        password: password,
        role: roleSelect.value,
        company: selectorItem,
        appAdmin: appAdmin
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

function createCompanySection(company) {
    return `
    <div class="section_shell2-layout ${company.name}" companyId="${company.companyId}">
        <div class="padding-horizontal padding-medium">
            <div class="container-large">
                <div class="padding-vertical padding-large padding-custom">
                    <div id="w-node-_1a30a1e4-8a69-abdf-86cf-348aa176e587-0240322d" class="w-layout-grid shell2-layout_component">
                        <div class="stacked-list1_component currentItems">
                            <div class="section-header2_component">
                                <div class="padding-bottom padding-small">
                                    <div class="section-header2_content-wrapper">
                                        <div class="max-width-large">
                                            <div class="company-header">
                                                <h2 class="heading-style-h5">${company.name}</h2>
                                                <div class="logo-section">
                                                    <img src="${company.ppURL ? company.ppURL : "/images/6191a88a1c0e39463c2bf022_placeholder-image.svg"}" alt="${company.name} Logo" class="company-logo">
                                                </div>
                                            </div>
                                            <div class="margin-top margin-xxsmall"></div>
                                        </div>
                                        <div class="section-header2_content-right">
                                            <button onclick="window.location.reload()">
                                            <!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                                             <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">

                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />

                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

                                    <g id="SVGRepo_iconCarrier">
                                      <path
                                        d="M18.43 4.25C18.2319 4.25259 18.0426 4.33244 17.9025 4.47253C17.7625 4.61263 17.6826 4.80189 17.68 5V7.43L16.84 6.59C15.971 5.71363 14.8924 5.07396 13.7067 4.73172C12.5209 4.38948 11.2673 4.35604 10.065 4.63458C8.86267 4.91312 7.7515 5.49439 6.83703 6.32318C5.92255 7.15198 5.23512 8.20078 4.84001 9.37C4.79887 9.46531 4.77824 9.56821 4.77947 9.67202C4.7807 9.77583 4.80375 9.87821 4.84714 9.97252C4.89052 10.0668 4.95326 10.151 5.03129 10.2194C5.10931 10.2879 5.20087 10.3392 5.30001 10.37C5.38273 10.3844 5.4673 10.3844 5.55001 10.37C5.70646 10.3684 5.85861 10.3186 5.98568 10.2273C6.11275 10.136 6.20856 10.0078 6.26001 9.86C6.53938 9.0301 7.00847 8.27681 7.63001 7.66C8.70957 6.58464 10.1713 5.98085 11.695 5.98085C13.2188 5.98085 14.6805 6.58464 15.76 7.66L16.6 8.5H14.19C13.9911 8.5 13.8003 8.57902 13.6597 8.71967C13.519 8.86032 13.44 9.05109 13.44 9.25C13.44 9.44891 13.519 9.63968 13.6597 9.78033C13.8003 9.92098 13.9911 10 14.19 10H18.43C18.5289 10.0013 18.627 9.98286 18.7186 9.94565C18.8102 9.90844 18.8934 9.85324 18.9633 9.78333C19.0333 9.71341 19.0885 9.6302 19.1257 9.5386C19.1629 9.44699 19.1814 9.34886 19.18 9.25V5C19.18 4.80109 19.101 4.61032 18.9603 4.46967C18.8197 4.32902 18.6289 4.25 18.43 4.25Z"
                                        fill="#ffffff" />
                                      <path
                                        d="M18.68 13.68C18.5837 13.6422 18.4808 13.6244 18.3774 13.6277C18.274 13.6311 18.1724 13.6555 18.0787 13.6995C17.9851 13.7435 17.9015 13.8062 17.8329 13.8836C17.7643 13.9611 17.7123 14.0517 17.68 14.15C17.4006 14.9799 16.9316 15.7332 16.31 16.35C15.2305 17.4254 13.7688 18.0291 12.245 18.0291C10.7213 18.0291 9.25957 17.4254 8.18001 16.35L7.34001 15.51H9.81002C10.0089 15.51 10.1997 15.431 10.3403 15.2903C10.481 15.1497 10.56 14.9589 10.56 14.76C10.56 14.5611 10.481 14.3703 10.3403 14.2297C10.1997 14.089 10.0089 14.01 9.81002 14.01H5.57001C5.47115 14.0086 5.37302 14.0271 5.28142 14.0643C5.18982 14.1016 5.1066 14.1568 5.03669 14.2267C4.96677 14.2966 4.91158 14.3798 4.87436 14.4714C4.83715 14.563 4.81867 14.6611 4.82001 14.76V19C4.82001 19.1989 4.89903 19.3897 5.03968 19.5303C5.18034 19.671 5.3711 19.75 5.57001 19.75C5.76893 19.75 5.95969 19.671 6.10034 19.5303C6.241 19.3897 6.32001 19.1989 6.32001 19V16.57L7.16001 17.41C8.02901 18.2864 9.10761 18.926 10.2934 19.2683C11.4791 19.6105 12.7327 19.6439 13.935 19.3654C15.1374 19.0869 16.2485 18.5056 17.163 17.6768C18.0775 16.848 18.7649 15.7992 19.16 14.63C19.1926 14.5362 19.2061 14.4368 19.1995 14.3377C19.1929 14.2386 19.1664 14.1418 19.1216 14.0532C19.0768 13.9645 19.0146 13.8858 18.9387 13.8217C18.8629 13.7576 18.7749 13.7094 18.68 13.68Z"
                                        fill="#ffffff" />
                                    </g>

                                  </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <hr>
                            <div class="stacked-list1_list-wrapper"></div>
                        </div>
                        <!-- Rest des Codes bleibt gleich -->
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
}
function createCompanyAdminSection(company) {
    return `
    <hr>
    <div class="section_shell2-layout companyAdmin ${company.name}" companyId="${company.companyId}">
              <div class="padding-horizontal padding-medium">
                <div class="container-large">
                  <div class="padding-vertical padding-custom">
                    <div id="w-node-_1a30a1e4-8a69-abdf-86cf-348aa176e587-0240322d"
                      class="w-layout-grid shell2-layout_component">
                      <div class="stacked-list1_component currentItems">
                        <div class="section-header2_component">
                          <div class="padding-bottom padding-small">
                            <div class="section-header2_content-wrapper">
                              <div class="max-width-large">
                                <h2 class="heading-style-h5">${company.name} company administrator's 🏢</h2>
                                <div class="margin-top margin-xxsmall">
                                  <div>This user is responsible for managing your company and has administrative rights over your organization.</div>
                                </div>
                                </div>
                              <div class="section-header2_content-right">
                                <button onclick="window.location.reload()">
                                  <!-- Uploaded to: SVG Repo, www.svgrepo.com, Transformed by: SVG Repo Mixer Tools -->
                                  <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none"
                                    xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">

                                    <g id="SVGRepo_bgCarrier" stroke-width="0" />

                                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round" />

                                    <g id="SVGRepo_iconCarrier">
                                      <path
                                        d="M18.43 4.25C18.2319 4.25259 18.0426 4.33244 17.9025 4.47253C17.7625 4.61263 17.6826 4.80189 17.68 5V7.43L16.84 6.59C15.971 5.71363 14.8924 5.07396 13.7067 4.73172C12.5209 4.38948 11.2673 4.35604 10.065 4.63458C8.86267 4.91312 7.7515 5.49439 6.83703 6.32318C5.92255 7.15198 5.23512 8.20078 4.84001 9.37C4.79887 9.46531 4.77824 9.56821 4.77947 9.67202C4.7807 9.77583 4.80375 9.87821 4.84714 9.97252C4.89052 10.0668 4.95326 10.151 5.03129 10.2194C5.10931 10.2879 5.20087 10.3392 5.30001 10.37C5.38273 10.3844 5.4673 10.3844 5.55001 10.37C5.70646 10.3684 5.85861 10.3186 5.98568 10.2273C6.11275 10.136 6.20856 10.0078 6.26001 9.86C6.53938 9.0301 7.00847 8.27681 7.63001 7.66C8.70957 6.58464 10.1713 5.98085 11.695 5.98085C13.2188 5.98085 14.6805 6.58464 15.76 7.66L16.6 8.5H14.19C13.9911 8.5 13.8003 8.57902 13.6597 8.71967C13.519 8.86032 13.44 9.05109 13.44 9.25C13.44 9.44891 13.519 9.63968 13.6597 9.78033C13.8003 9.92098 13.9911 10 14.19 10H18.43C18.5289 10.0013 18.627 9.98286 18.7186 9.94565C18.8102 9.90844 18.8934 9.85324 18.9633 9.78333C19.0333 9.71341 19.0885 9.6302 19.1257 9.5386C19.1629 9.44699 19.1814 9.34886 19.18 9.25V5C19.18 4.80109 19.101 4.61032 18.9603 4.46967C18.8197 4.32902 18.6289 4.25 18.43 4.25Z"
                                        fill="#ffffff" />
                                      <path
                                        d="M18.68 13.68C18.5837 13.6422 18.4808 13.6244 18.3774 13.6277C18.274 13.6311 18.1724 13.6555 18.0787 13.6995C17.9851 13.7435 17.9015 13.8062 17.8329 13.8836C17.7643 13.9611 17.7123 14.0517 17.68 14.15C17.4006 14.9799 16.9316 15.7332 16.31 16.35C15.2305 17.4254 13.7688 18.0291 12.245 18.0291C10.7213 18.0291 9.25957 17.4254 8.18001 16.35L7.34001 15.51H9.81002C10.0089 15.51 10.1997 15.431 10.3403 15.2903C10.481 15.1497 10.56 14.9589 10.56 14.76C10.56 14.5611 10.481 14.3703 10.3403 14.2297C10.1997 14.089 10.0089 14.01 9.81002 14.01H5.57001C5.47115 14.0086 5.37302 14.0271 5.28142 14.0643C5.18982 14.1016 5.1066 14.1568 5.03669 14.2267C4.96677 14.2966 4.91158 14.3798 4.87436 14.4714C4.83715 14.563 4.81867 14.6611 4.82001 14.76V19C4.82001 19.1989 4.89903 19.3897 5.03968 19.5303C5.18034 19.671 5.3711 19.75 5.57001 19.75C5.76893 19.75 5.95969 19.671 6.10034 19.5303C6.241 19.3897 6.32001 19.1989 6.32001 19V16.57L7.16001 17.41C8.02901 18.2864 9.10761 18.926 10.2934 19.2683C11.4791 19.6105 12.7327 19.6439 13.935 19.3654C15.1374 19.0869 16.2485 18.5056 17.163 17.6768C18.0775 16.848 18.7649 15.7992 19.16 14.63C19.1926 14.5362 19.2061 14.4368 19.1995 14.3377C19.1929 14.2386 19.1664 14.1418 19.1216 14.0532C19.0768 13.9645 19.0146 13.8858 18.9387 13.8217C18.8629 13.7576 18.7749 13.7094 18.68 13.68Z"
                                        fill="#ffffff" />
                                    </g>
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <hr>
                        <div class="stacked-list1_list-wrapper">
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    `;
}


async function buildCompanyShells() {
    let data = await getCompanies()
    const allCompanies = data.allCompanies;
    let mainWrapper = document.querySelector('.shell2_main-wrapper');

    if (allCompanies.length !== 0) {
        allCompanies.forEach(function (company) {
            let companyAdminSection = createCompanyAdminSection(company);
            let companySection = createCompanySection(company);
            mainWrapper.insertAdjacentHTML('beforeend', companyAdminSection);
            mainWrapper.insertAdjacentHTML('beforeend', companySection);

        });
    }
    else {
        const noCompanies = document.querySelector(".NoCompanies")
        noCompanies.style.display = "block"

    }

    await getAllUser();

}



document.getElementById('changeDetailsForm').addEventListener('submit', submitForm);