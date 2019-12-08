#!/usr/bin/env node

const fs = require('fs').promises;
const path = require('path');
const pkg = require('../package');
const yargs = require('yargs');
const { Sounds } = require('./');

yargs
    .scriptName('rsc-sounds')
    .version(pkg.version)
    .command(
        'dump-wav <archive> [sounds..]',
        'extract WAV files from a sounds mem archive',
        yargs => {
            yargs.positional('archive', {
                description: 'sounds mem archive',
                type: 'string'
            });

            yargs.option('input', {
                alias: 'i',
                description: 'JSON file with sound name array',
                type: 'string'
            });

            yargs.option('output', {
                alias: 'o',
                description: 'directory to dump WAV files',
                type: 'string',
                default: './'
            });
        },
        async argv => {
            const sounds = new Sounds();

            try {
                let soundNames;

                if (argv.input) {
                    soundNames = JSON.parse(await fs.readFile(argv.input));
                } else {
                    soundNames = argv.sounds;
                }

                if (!soundNames || !soundNames.length) {
                    throw new Error('no sound names specified');
                }

                sounds.loadArchive(await fs.readFile(argv.archive));

                for (const soundName of soundNames) {
                    await fs.writeFile(
                        path.join(argv.output, `${soundName}.wav`),
                        sounds.getWav(soundName));
                }
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .command(
        'pack-wav <archive> <files..>',
        'pack WAV file(s) into a sounds mem archive',
        yargs => {
            yargs.positional('archive', {
                description: 'sounds mem archive',
                type: 'string'
            });

            yargs.positional('files', {
                description: 'WAV files to add to the sounds archive'
            });
        },
        async argv => {
            const sounds = new Sounds();

            try {
                sounds.loadArchive(await fs.readFile(argv.archive));
            } catch (e) {
                // ignore - script will create a new archive
            }

            try {
                for (const filename of argv.files) {
                    const wavFile = await fs.readFile(filename);
                    // this should usually be wav, but save anyway
                    const extName = path.extname(filename);
                    const soundName = path.basename(filename, extName);

                    sounds.putWav(soundName, wavFile);
                }

                await fs.writeFile(argv.archive, sounds.toArchive());
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .command(
        'play <archive> <sound>',
        'play a sound from an archive',
        yargs => {
            yargs.positional('archive', {
                description: 'sounds mem archive',
                type: 'string'
            });

            yargs.positional('sound', {
                description: 'sound name to play',
                type: 'string'
            });
        },
        async argv => {
            const sounds = new Sounds();

            try {
                sounds.loadArchive(await fs.readFile(argv.archive));
                const duration = sounds.playSound(argv.sound);
                setTimeout(() => console.log(`${duration / 1000}s`), duration);
            } catch (e) {
                process.exitCode = 1;
                console.error(e);
            }
        })
    .demandCommand()
    .argv;
