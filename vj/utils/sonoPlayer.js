import _ from 'lodash';
import Utils from 'utils';
import Emitter from 'emitter';
import Playlist from 'playlist';
import sono from '@stinkdigital/sono';
// Define
const Sono = (() => {

    const CHECK_INTERVAL = 0.5;

    let sounds = {

    };

    let currentClip;
    let currentSound;
    let interviewPauseTime;

    let canvas, context;
    let analzyer, waveformer;

    //400;
    let canvasWidth;


    function start(interview) {
        let i = sounds.interview = sono.createSound({
            id: 'interview',
            src: interview.paths
        });
        i.play();
        analzyer = i.effect.analyser(512);

        canvas = document.querySelector('[data-js="waveform"]');
        context = canvas.getContext('2d');
        _getInterviewTime();

    }

    function playClip(sound) {
        if (sound.playing) {
            return;
        }
        interviewPauseTime = sounds.interview.currentTime;
        sounds.interview.pause();
        analzyer = sound.effect.analyser(512);
        sound.play();
    }

    function _onSoundEnded() {
        analzyer = sounds.interview.effect.analyser(512);
        sounds.interview.play(0, interviewPauseTime);
    }

    function _createClip(clip) {
        let c = sounds[clip.speaker] = sounds[clip.speaker] || [];
        let s = sono.createSound({
            id: `${clip.speaker}-${c.length}`,
            src: clip.paths
        });
        s.on('ended', _onSoundEnded);
        c.push(s);
        currentSound = s;
        return s;
    }

    function _getInterviewTime(i) {
        let currentTime = sounds.interview.currentTime;
        if (currentTime % CHECK_INTERVAL < 0.1) {
            let foundClip = Playlist.getClip(currentTime);
            if (foundClip && currentTime !== foundClip) {
                currentClip = foundClip;
                let sound = _createClip(currentClip);
                Emitter.emit('newclip', sound);
            }
        }

        let waveByteData = analzyer.getWaveform();
        let magnitude, percent, hue;
        //analyserNode.getAmplitude(onAmplitude);
        context.clearRect(0, 0, 400, 60);
        for (var i = 0, l = waveByteData.length; i < l; i++) {
            magnitude = waveByteData[i];
            percent = magnitude / 256;
            hue = i / l * 360;
            context.fillStyle = "#000000";
            context.fillRect(2 * i, 40 - 40 * percent - 1, 2, 2);
        }

        window.requestAnimationFrame(_getInterviewTime);
    }

    return {
        start: start,
        playClip: playClip
    }
})();

// Export
export default Sono;