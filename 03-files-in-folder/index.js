const fs = require('fs/promises');
const path = require('path');

const secretFolderPath = path.join(__dirname, 'secret-folder');


async function getFilesInfo() {
  try {
    const files = await fs.readdir(secretFolderPath, {withFileTypes: true});

    for (const file of files) {
      const type = file[Object.getOwnPropertySymbols(file)[0]];
      if (type !== 1) {
        continue;
      }

      const name = path.basename(file.name, path.extname(file.name));
      const extension = path.extname(file.name).slice(1);
      const filePath = path.join(__dirname, 'secret-folder', file.name);
      const stats = await fs.stat(filePath);

      console.log(`${name} - ${extension} - ${stats.size/1000}kb`);
    }
  } catch (err) {
    console.error(err);
  }
}

getFilesInfo();