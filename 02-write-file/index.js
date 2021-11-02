const process = require('process');
const path = require('path');
const fs = require('fs');
const readline = require('readline');

const writeStream = fs.createWriteStream(path.join(__dirname, 'new_file.txt'));

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'Write something here to save > ',
});

rl.prompt();

rl.on('line', function(line) {
  if (line === 'exit') {
    console.log('\nBye!');
    process.exit(0);
  }
  writeStream.write(line + '\n');
}).on('close',function(){
  console.log('\nBye!');
  process.exit(0);
});