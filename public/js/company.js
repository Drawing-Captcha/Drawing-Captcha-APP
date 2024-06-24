const addDialog = document.querySelector("#addCompanyDialog");
let imageUpload = document.getElementById('imageUpload');
let addDialogForm = document.querySelector("#addCompanyForm")
const nameInput = addDialogForm.querySelector("#username")
let ppURL;

let profileImage = document.getElementById('profileImage');
imageUpload.addEventListener('change', function () {
    let reader = new FileReader();
    reader.onload = function (e) {
        profileImage.src = e.target.result;
        ppURL = e.target.result
    }
    reader.readAsDataURL(this.files[0]);
});

function addCompany(){
    addDialog.showModal();


}


async function proofRegex(originName) {
    console.log(originName)
    originName = nameInput.value.trim();
    console.log(originName)

    if (originName.endsWith("/")) {
        originName = originName.slice(0, -1)
        console.log(originName)
    }
    const expression = /^(https?:\/\/)?((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?$/i;
    const regex = new RegExp(expression);

    if (regex.test(originName)) {
        submitOrigin(originName);
    } else {
        alert("Regex error: please define your origin like this schema: https://yourdomain.com");
    }
}

function submitOrigin(originName){
    fetch("/dashboard/allowedOrigins", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ originName })
    })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Error server while trying to request the server');
            }
        })
        .then(data => {
            if (data.message) {
                alert(data.message)
                location.reload();
            }

        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again later.');
        });
}



async function submitCompany(event){
    event.preventDefault();
    await proofRegex(nameInput.value)

    let submittedData = {
        name: nameInput.value,
        ppURL   
    }

    fetch("/dashboard/addCompany", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(submittedData)
    })
    .then(response => response.json())
    .then(data => {
        if(data.message){
            alert(data.message);
        }
        if (data.redirect) {
            window.location.href = data.redirect;
        } else {
            location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert(`An error occurred: ${error.message}`);
    });
}


addDialogForm.addEventListener('submit', submitCompany);
