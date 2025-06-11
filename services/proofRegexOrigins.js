function proofRegexOrigins(originName) {
    if (!originName) {
        alert("Please enter a origin, you can still change it afterwarts in the settings");
        return;
    }
    originName = originName.trim();

    if (originName.endsWith("/")) {
        originName = originName.slice(0, -1)
    }
    const expression = /^https?:\/\/((([a-z0-9]+)*\.)?[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}|(localhost|127\.0\.0\.1))(:[0-9]{1,5})?(\/.*)?$/i;
    const regex = new RegExp(expression);

    if (regex.test(originName)) {
        return { test: true, value: originName };
    } else {
        alert("Regex error: please define your origin like this schema: https://yourdomain.com");
        return { test: false, value: "" };
    }
}

module.exports = proofRegexOrigins;