import Q from 'bluebird';
import Signals from 'signals';

import Utils from '../utils/utils';
import Emitter from '../utils/emitter';

import ServerService from '../service/serverService';
import VjUtils from '../vj-utils';

class ControllerBase {
    constructor(subtitles, options) {
        this._addVoSignal = new Signals()
        this._emitVoBound = this._onMediaSourceReady.bind(this)
        this._onEndingSignalBound = this._onEndingSignal.bind(this)
    }

    get addVoSignal() {
        return this._addVoSignal
    }

    get options(){
        return this._options
    }

    get mediaSource() {
        return this._mediaSource
    }

    set mediaSource(ms) {
        this._mediaSource = ms
        ms.readySignal.addOnce(this._emitVoBound)
        ms.endingSignal.add(this._onEndingSignalBound)
        this._onMediaSourceSet()
    }

    _onEndingSignal() {
    }

    _onMediaSourceSet(){

    }

    addVo(){

    }

    getVo(){

    }

    _onMediaSourceReady(mediaSource){

    }
}

export default ControllerBase;