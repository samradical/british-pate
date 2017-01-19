import sono from '@stinkdigital/sono';
import Analyzer from './audio-analysis'
const FADE_DUR = 2
const PEAK_CHECK = 4
class AudioController {
    constructor(config) {
        this._sound = sono.createSound(config)
        this._sound.on('loaded', () => {
            this._peaks = this._analyser.getPeaks(this._sound, { minPeakThreshold: 0.2 })
            this._peaks.peakIndex = 0
            this._peaks.peakLength = this._peaks.peaks.length
            this._peaks.dropIndex = 0
            this._peaks.dropLength = this._peaks.drops.length
            this._duration = this._sound.duration
        })
        this._sound.play()
        let _anal = sono.effect.analyser({ fftSize: 128 })
        this._analyser = new Analyzer(_anal)
        this._c = 0
    }

    atPeak() {
        if(!this._peaks){
            return false
        }
        let t = this._sound.progress * this._duration
        let _found = false
        for (var i = 0; i < this._peaks.peakLength; i++) {
            let _p= this._peaks.peaks[i]
            if (t > _p.start && t < _p.end && !_p.used) {
                _p.used = true
                _found = true
                for (var k = 0; k < i; k++) {
                    this._peaks.peaks[k].used = false
                }
                break;
            }
        }
        return _found
    }

    _checkPeaks(t) {

    }

    getAmplitude(cb) {
        return this._analyser.getAmplitude(cb)
    }
}

export default AudioController;