const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const process = require('process');

const stylesPath = path.join(__dirname, 'styles');
const projectPath = path.join(__dirname, 'project-dist');

async function buildBundle() {
  try {
    const bundlePath = path.join(projectPath, 'bundle.css');

    try {
      await fsPromises.unlink(bundlePath);
    } catch(err) {
      console.log('No bundle.css file. Creating...');
    }
    
    const writeStream = fs.createWriteStream(bundlePath);
    const files = await fsPromises.readdir(stylesPath, {withFileTypes: true});

    for (const file of files) {
      const type = file[Object.getOwnPropertySymbols(file)[0]];
      const extension = path.extname(file.name);
      if (type !== 1 || extension !== '.css') {
        continue;
      }

      const fh = await fsPromises.open(path.join(stylesPath, file.name))
      const content = await fh.readFile('utf8');
      writeStream.write(content);
    }
  } catch (err) {
    console.error(err);
  }
}

buildBundle();