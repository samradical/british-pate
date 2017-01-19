import Sono from '@stinkdigital/sono'

const THREHSOLD = 0.5
const MIN_THREHSOLD = 0.3
const MIN_PEAKS = 30

//quite aggress
const DROP_THREHSOLD = 0.3
const MIN_DROP_THREHSOLD = 0.1
const MIN_DROPS = 20
    //The voiced speech of a typical adult male will have a fundamental frequency from 85 to 180 Hz,
const LOW_PASS_FREQ = 85

const DEFAULT = {
    channel:0,

    peakThreshold:THREHSOLD,
    minPeakThreshold:MIN_THREHSOLD,
    minPeaks:MIN_PEAKS,

    dropThreshold:DROP_THREHSOLD,
    minDropThreshold:MIN_DROP_THREHSOLD,
    minDrops:MIN_DROPS,

    lowPassFreq:LOW_PASS_FREQ
}
/*
WOrker

onmessage = function(e) {
	var _c = -1;
    var data = e.data;
    var waveByteData = new Float32Array(data.b);
    var fftSize = data.fftSize;
    var groupNumber = data.groupNumber;
    var _groupSize = (fftSize / groupNumber);
    var groups = new Array(groupNumber).fill(0);
    for (var i = 0, l = waveByteData.length; i < l; i++) {
	    	if(i % _groupSize === 0){
	    		_c++
	    	}
            var _d = waveByteData[i] || 0;
	    	groups[_c] += (_d/fftSize/_groupSize)
    }
    postMessage(groups);
};

*/

export default class AudioAnalysis {
    constructor(analyzer) {
        this._offlineCtx = Sono.getOfflineContext();
        this._analyzer = analyzer
            // you will have to decompress
        const breakdownBlob = new Blob(["onmessage=function(e){var _c=-1;var data=e.data;var waveByteData=new Float32Array(data.b);var fftSize=data.fftSize;var groupNumber=data.groupNumber;var _groupSize=(fftSize/groupNumber);var groups=new Array(groupNumber).fill(0);for(var i=0,l=waveByteData.length;i<l;i++){if(i%_groupSize===0){_c++}var _d=waveByteData[i]||0;groups[_c]+=(_d/fftSize/_groupSize)}postMessage(groups)};"]);
        const breakdownBlobURL = URL.createObjectURL(breakdownBlob);
        this._breakdownWorker = new Worker(breakdownBlobURL);

        this._breackdownCb = undefined;

        this._breakdownWorker.onmessage = (e) => {
            if (this._breackdownCb) {
                this._breackdownCb(e.data);
            }
        }
    }

    _getOfflineCtx() {
        this._offlineCtx = this._offlineCtx || Sono.getOfflineContext();
        return this._offlineCtx;
    }

    getPitch(cb) {
        this._analyzer.getPitch(cb);
    }

    getAmplitude(cb) {
        this._analyzer.getAmplitude(cb);
    }

    /*
    groupNumber is how many times the waveform data should be devided. multiples 4 only please
    */

    getBreakdown(groupNumber, cb) {
        if (this._breackdownCb !== cb) {
            this._breackdownCb = cb
        }

        let _f = new Float32Array(this._analyzer.fftSize)
        _f.set(this.getWaveform());
        this._breakdownWorker.postMessage({
            fftSize: this._analyzer.fftSize,
            groupNumber: groupNumber,
            b: _f.buffer
        }, [_f.buffer]);
    }


    /*
    peaks are volumes above a threshhold
    drops are relative to volume of the previous sample
    */
    getPeaks(sound, options) {

        options = Object.assign({}, DEFAULT, options)

        let soundBuffer = sound.sourceNode.buffer;
        let _ctx = this._getOfflineCtx()
        let source = _ctx.createBufferSource()
        source.buffer = soundBuffer

        let filter = _ctx.createBiquadFilter()
        filter.frequency.value = options.lowPassFreq
        filter.type = "lowpass"

        source.connect(filter)
        filter.connect(_ctx.destination)

        source.start(0)
        let thresold = options.peakThreshold
        let dropThreshold = options.dropThreshold
        let peaks
        let drops
        do {
            peaks = this._getPeaksAtThreshold(soundBuffer.getChannelData(options.channel), thresold);
            thresold -= 0.05;
        } while (peaks.length < options.minPeaks && thresold >= options.minPeakThreshold);

        do {
            drops = this._getDrops(soundBuffer.getChannelData(options.channel), dropThreshold);
            dropThreshold -= 0.01;
        } while (drops.length < options.minDrops && dropThreshold >= options.minDropThreshold);

        peaks.forEach((peak, i)=>{
        	let _start = peak;
        	let _dur = (peaks[i+1] || sound.duration) - _start
        	peaks[i] = { start:_start, end: _start+_dur}
        })

        drops.forEach((drop, i)=>{
        	let _start = drop;
        	let _dur = (drops[i+1] || sound.duration) - _start
        	drops[i] = { start:_start, end: _start+_dur}
        })

        return {
        	peaks,
        	drops
        }
    }

    // Function to identify peaks
    _getPeaksAtThreshold(data, threshold) {
        let peaksTimes = [];
        let length = data.length;
        for (let i = 0; i < length;) {
            if (data[i] > threshold) {
                peaksTimes.push(i / 44100);
                // Skip forward ~ 1/4s to get past this peak.
                i += 11025;
            }
            i++;
        }
        return peaksTimes;
    }

    // Function to identify peaks, returns seconds
    _getDrops(data, threshold) {
        let dropArrays = [];
        let interval = 11025;
        let length = data.length;
        for (let i = 0; i < length;) {
            let diff = data[i] - (data[i - interval] || 0);
            if (diff > threshold) {
                dropArrays.push(i / 44100);
            }
            i += interval;
        }
        return dropArrays;
    }

    //***
    //SONO
    //***

    getWaveform(float) {
        return this._analyzer.getWaveform(float)
    }

    getFloatTimeDomainData() {
        let _f = new Float32Array(this._analyzer.fftSize)
        this._analyzer.getFloatTimeDomainData(_f)
        return _f
    }

    getByteTimeDomainData() {
        let _f = new Uint8Array(this._analyzer.fftSize)
        this._analyzer.getByteTimeDomainData(_f)
        return _f
    }

}