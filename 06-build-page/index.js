const fs = require('fs');
const fsPromises = require('fs/promises');
const path = require('path');
const process = require('process');

const templatePath = path.join(__dirname, 'template.html');
const componentsPath = path.join(__dirname, 'components');
const stylesPath = path.join(__dirname, 'styles');
const projectPath = path.join(__dirname, 'project-dist');

const assetsPath = path.join(__dirname, 'assets');
const assetsProjPath = path.join(projectPath, 'assets');

async function removeFiles(dir) {
  try {
    await fsPromises.rm(dir, { recursive: true, force: true });
  } catch (err) {
    console.error(err);
  }
}

async function copyDir(src, dest) {
  await fsPromises.mkdir(dest, { recursive: true });
  let entries = await fsPromises.readdir(src, { withFileTypes: true });

  for (let entry of entries) {
      let srcPath = path.join(src, entry.name);
      let destPath = path.join(dest, entry.name);

      entry.isDirectory() ?
          await copyDir(srcPath, destPath) :
          await fsPromises.copyFile(srcPath, destPath);
  }
}

async function updateAssets() {
  await fsPromises.mkdir(assetsProjPath, {recursive: true});
  await removeFiles(assetsProjPath);

  try {
    await copyDir(assetsPath, assetsProjPath);
  } catch (err) {
    console.error(err);
  }
}

async function buildCSSBundle() {
  try {
    const bundleCSSPath = path.join(projectPath, 'style.css');

    try {
      await fsPromises.unlink(bundleCSSPath);
    } catch(err) {
      console.log('No bundle.css file. Creating...');
    }
    
    const writeStream = fs.createWriteStream(bundleCSSPath);
    const files = await fsPromises.readdir(stylesPath, {withFileTypes: true});

    // make sure footer style is at the bottom
    files.sort((a,b) => {
      return a.name === 'footer.css' ? 1 : b.name === 'footer.css' ? -1 : 0
    })

    for (const file of files) {
      const type = file[Object.getOwnPropertySymbols(file)[0]];
      const extension = path.extname(file.name);
      if (type !== 1 || extension !== '.css') {
        continue;
      }

      const fh = await fsPromises.open(path.join(stylesPath, file.name));
      const content = await fh.readFile('utf8');
      writeStream.write(content);
    }
  } catch (err) {
    console.error(err);
  }
}

async function replaceTemplateStrings(str, regex) {
  const promises = [];

  str.replace(regex, (match) => {
    const componentName = match.replace(/[\{\}]/g, '') + '.html';

    const promise = fsPromises.readFile(path.join(componentsPath, componentName), 'utf8');
    promises.push(promise);
  });

  const data = await Promise.all(promises);
  
  return str.replace(regex, () => data.shift());
}

async function createBundle() {
  const templateData = await fsPromises.readFile(templatePath, 'utf8');
  const indexData = await replaceTemplateStrings(templateData, /\{\{.+\}\}/g);

  const indexPath = path.join(projectPath, 'index.html');

  try {
    await fsPromises.unlink(indexPath);
  } catch(err) {
    console.log('No index.html file. Creating...');
  }

  await fsPromises.mkdir(projectPath, {recursive: true});
  await fsPromises.writeFile(indexPath, indexData);

  buildCSSBundle();
  updateAssets();
  
  // TODO fix order of style.css files
}

createBundle();