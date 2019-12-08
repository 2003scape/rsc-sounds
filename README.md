# rsc-sounds
extract runescape classic sounds from cache to wav (and vice versa). jagex used
Sun's original [.au sound format](https://en.wikipedia.org/wiki/Au_file_format),
which is headerless, 8-bit, u-law encoded, 8000 Hz pcm samples. this module can
decompress original sounds from sound archives as
[headered WAVs](https://en.wikipedia.org/wiki/WAV), and recompress (+ resample)
new WAVs into archives.

## install

    $ npm install @2003scape/rsc-sounds # use -g for the CLI program

## cli usage
```
rsc-sounds <command>

Commands:
  rsc-sounds dump-wav <archive> [sounds..]  extract WAV files from a sounds mem
                                            archive
  rsc-sounds pack-wav <archive> <files..>   pack WAV file(s) into a sounds mem
                                            archive
  rsc-sounds play <archive> <sound>         play a sound from an archive

Options:
  --help     Show help                                                 [boolean]
  --version  Show version number                                       [boolean]
```

    $ rsc-sounds play sounds1.mem death # play death sound on speaker
    $ rsc-sounds pack-wav sounds2.mem scream.wav chop.wav # add new sounds
    $ rsc-sounds dump-wav sounds1.mem -i sounds1.json # dump all original sounds
    $ rsc-sounds dump-wav sounds1.mem death # dump death.wav

## example
```javascript
const fs = require('fs');
const { Sounds } = require('@2003scape/rsc-sounds');

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
```

## api
### sounds = new Sounds()
create a new sound (de)serializer instance.

### sounds.loadArchive(buffer)
load a sounds mem archive buffer.

### sounds.putWav(name, buffer)
re-encode and re-sample any WAV file and add it to the archive buffer.

### sounds.getWav(name)
return a headered WAV file from the archive buffer.

### sounds.playSound(name)
play a sound from the archive on the speakers (works in browser as well).

### sounds.toArchive()
return a sounds mem archive.

## license
Copyright 2019  2003Scape Team

This program is free software: you can redistribute it and/or modify it under
the terms of the GNU Affero General Public License as published by the
Free Software Foundation, either version 3 of the License, or (at your option)
any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY
WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along
with this program. If not, see http://www.gnu.org/licenses/.
