async function removeCheck(element) {
    const items = document.querySelectorAll(".item")
    if (element) {
        items.forEach(item => {
            if (element = item && item.classList.contains("checked")) {
                item.classList.remove("checked")
            }
        })
    }
    else {
        items.forEach(item => {
            if (item.classList.contains("checked")) {
                item.classList.remove("checked")
            }
        })
    }

}