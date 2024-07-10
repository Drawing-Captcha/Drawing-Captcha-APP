const fs = require('node:fs');

const folderName = './tmpimg';
function createDirectory(){
    try {
        if (!fs.existsSync(folderName)) {
          fs.mkdirSync(folderName);
          console.log("tmpimg direcory successfully created")
        }
        else console.log("tmpimg directory already exists")
      } catch (err) {
        console.log("tmpimg direcory failed to create")
        console.error(err);
      }
}


module.exports = createDirectory;