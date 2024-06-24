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

function submitCompany(event){
    event.preventDefault();

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
