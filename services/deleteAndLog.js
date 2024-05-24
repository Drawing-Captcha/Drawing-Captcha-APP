function deleteAndLog() {
    deleteAllFilesInDir("./tmpimg")
        .then(() => console.log("All files deleted in ./tmpimg"))
        .catch(error => console.error("Error deleting files:", error));
}

module.exports = deleteAndLog