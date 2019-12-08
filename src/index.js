const Resampler = require('libsamplerate.js');
const { JagArchive } = require('@2003scape/rsc-archiver');
let WaveFile = require('wavefile');
let createSpeaker, PCMPlayer;

if (typeof window === 'undefined') {
    createSpeaker = require('audio-speaker');
} else {
    PCMPlayer = require('./lib/pcm-player');
    WaveFile = window.WaveFile;
}

const CHANNELS = 1;
const SAMPLE_RATE = 8000;
const BIT_DEPTH = '8m';

class Sounds {
    constructor() {
        this.archive = new JagArchive();
    }

    loadArchive(buffer) {
        this.archive = new JagArchive();
        this.archive.readArchive(buffer);
    }

    // add any WAV to the sound archive and use libsamplerate to lower the
    // sample rate if necessary
    putWav(name, buffer) {
        let wav = new WaveFile(buffer);

        const sampleRate = wav.fmt.sampleRate;

        if (sampleRate !== SAMPLE_RATE) {
            const resampler = Resampler({
                type: Resampler.Type.SINC_BEST_QUALITY,
                ratio: SAMPLE_RATE / sampleRate,
                channels: 1
            });

            // libsamplerate only works with 32-bit float arrays
            wav.toBitDepth('32f');
            const floatSamples = new Float32Array(wav.data.samples.buffer);
            resampler.write(Buffer.from(floatSamples.buffer));
            resampler.end();

            const resampled =
                new Float32Array(new Int8Array(resampler.read()).buffer);

            wav = new WaveFile();
            wav.fromScratch(1, SAMPLE_RATE, '32f', resampled);
        }

        wav.toMuLaw();
        this.archive.putEntry(`${name}.pcm`, wav.toBuffer());
    }

    getWaveFile(name) {
        const ulawData = this.archive.getEntry(`${name}.pcm`);
        const wav = new WaveFile();
        wav.fromScratch(CHANNELS, SAMPLE_RATE, BIT_DEPTH, ulawData);
        wav.fromMuLaw();
        wav.toBitDepth('16');

        return wav;
    }

    // get a 16-bit headered WAV of a sound name (or throw if non-existent)
    getWav(name) {
        const wav = this.getWaveFile(name);
        return wav.toBuffer();
    }

    // play a sound on the speakers (works on browser and node)
    playSound(name) {
        const wav = this.getWaveFile(name);

        const duration =
            (wav.chunkSize / (wav.dataType.bits / 8) / wav.fmt.sampleRate) *
            1000;

        if (typeof window === 'undefined') {
            const speaker = createSpeaker({
                channels: 1,
                sampleRate: 8000,
                bitDepth: 16
            });

            speaker.write(wav.data.samples);

            return duration;
        }

        const pcmPlayer = new PCMPlayer({
            encoding: '16bitInt',
            channels: 1,
            sampleRate: 8000
        });

        pcmPlayer.feed(wav.data.samples);

        return duration;
    }

    toArchive() {
        return this.archive.toArchive(true);
    }
}

module.exports.Sounds = Sounds;
