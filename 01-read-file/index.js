const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'text.txt');

const stream = fs.createReadStream(filePath, 'utf8');

stream.on('data', chunk => {
  console.log(chunk);
})
