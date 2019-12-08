const fs = require('fs');
const { Sounds } = require('./src');

if (typeof window !== 'undefined') {
    fs.writeFileSync = () => {};
}

// create sounds2.mem with a new .wav file
const sounds = new Sounds();
sounds.loadArchive(fs.readFileSync('./sounds1.mem'));
sounds.putWav('scream', fs.readFileSync('./scream.wav'));
fs.writeFileSync('./sounds2.mem', sounds.toArchive());

// load the archive and play the new sound
const sounds2 = new Sounds();
sounds2.loadArchive(fs.readFileSync('./sounds2.mem'));
fs.writeFileSync('./scream-recovered.wav', sounds2.getWav('scream'));
const duration = sounds2.playSound('scream');
setTimeout(() => console.log('done'), duration);
