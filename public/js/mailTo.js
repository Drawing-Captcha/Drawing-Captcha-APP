const mailToLink = document.querySelector(".mailTo");

mailToLink.addEventListener("click", function () {
    let id = Date.now()
    mailToLink.setAttribute("href", `mailto:info@wpesic.dev?subject=Drawing-Captcha%20%7C%20Support%20%23${id}&body=Hello%2C%0A%0AI%20am%20reaching%20out%20to%20request%20your%20assistance.%0A%0AKind%20regards%2C`);
})