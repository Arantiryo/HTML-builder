const fs = require('fs/promises');
const path = require('path');
const process = require('process');

const filesPath = path.join(__dirname, 'files');
const filesCopyPath = path.join(__dirname, 'files-copy');

async function removeFiles(dir) {
  try {
    const files = await fs.readdir(dir);
    for (const file of files)
      await fs.unlink(path.join(dir, file));
  } catch (err) {
    console.error(err);
  }
}

async function updateFiles() {
  await fs.mkdir(filesCopyPath, {recursive: true});
  await removeFiles(filesCopyPath);

  const files = await fs.readdir(filesPath, {withFileTypes: true}); 

  for (const file of files) {
    try {
      const filePath = path.join(filesPath, file.name);
      const newFilePath = path.join(filesCopyPath, file.name);

      await fs.copyFile(filePath, newFilePath);
      console.log(`${filePath} was copied to ${newFilePath}`);
    } catch {
      console.log('The file could not be copied');
    }
  }
}

updateFiles();
