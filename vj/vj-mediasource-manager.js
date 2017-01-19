import _ from 'lodash';

import Utils from './utils/utils';
import Emitter from './utils/emitter';
import Metronome from './utils/metronome';

import Signals from 'signals';

import ControlPerameters from './vj-control-perameters';
import VjMediaSource from './vj-mediasource';
import VjVideoCanvas from './vj-video-canvas';

import VjUtils from './vj-utils';

class VjManager {

    constructor(parent, options = {}) {
        this.options = options
        this.mediaSourcesConfigs = options.mediaSources;

        this.mediaSources = [];
        this.videoCanvases = [];
        this.playlists = [];

        this.parent = parent;
        this.boundUpdate = this._update.bind(this);


        Emitter.on('mediasource:ready', (mediasource) => {
            // this._contoller.getVo(mediasource.options)
            // .then(vo=>{
            //     mediasource.addVo(vo)
            // })
        })

        Emitter.on('controller:addVo', (mediasource) => {
            // this._contoller.getVo(mediasource.options)
            // .then(vo=>{
            //     mediasource.addVo(vo)
            // })
        })

        Emitter.on('mediasource:ending', (mediasource) => {

        })

        Emitter.on('mediasource:videostarting', (mediasource) => {
            for (let i = 0; i < this._videoCanvasesLength; i++) {
                this.videoCanvases[i].onResize(window.innerWidth, window.innerHeight);
            }
        })

        _.each(this.mediaSourcesConfigs, (mediaPlayersOptions) => {
            let _o = {
                readySignal: new Signals(),
                videoStartedSignal: new Signals(),
                endingSignal: new Signals(),
                endedSignal: new Signals()
            }
            _.forIn(_o, (val, key) => {
                mediaPlayersOptions[key] = val
            })
            Object.freeze(mediaPlayersOptions)
            this._createMediaSource(mediaPlayersOptions)
        })

        //the controller
        // this._contoller = options.controller
        //this._contoller.mediaSources = this.mediaSources

        /*Emitter.on(`playother`, (index) => {
            this.mediaSources.forEach((ms, i) => {
                if (i !== index) {
                    ms.play()
                }
            })
        })

        Emitter.on(`source0Video`, (direction) => {
            if (direction === 'down') {
                this.mediaSources[0].stepBack(5 * ControlPerameters.video.stepBack.value)
            } else {
                this.mediaSources[0].stepForward(5 * ControlPerameters.video.stepBack.value)
            }
        })

        Emitter.on(`source1Video`, (direction) => {
            if (direction === 'down') {
                this.mediaSources[1].stepBack(5 * ControlPerameters.video.stepBack.value)
            } else {
                this.mediaSources[1].stepForward(5 * ControlPerameters.video.stepBack.value)
            }
        })*/

        this._metronome = new Metronome({
            "tempo": 120,
            "beatsPerBar": 4,
            "loopLength": 4
        })

        this._update();
    }

    _createMediaSource(options) {
        let _ms = new VjMediaSource(options)
        this.mediaSources.push(_ms);
        this.mediaSourcesLength = this.mediaSources.length

        if (!options.isAudio) {
            this.videoCanvases.push(new VjVideoCanvas(_ms.el, options));
            this._videoCanvasesLength = this.videoCanvases.length
        }
        options.controller.mediaSource = _ms
        if (options.verbose) {
            this.parent.appendChild(_ms.el);
        }
    }

    _update() {
        for (let i = 0; i < this._videoCanvasesLength; i++) {
            this.videoCanvases[i].update();
        }
        if (this.options.autoUpdate) {
            this.requestId = window.requestAnimationFrame(this.boundUpdate);
        }
    }

    onWindowResize(w, h) {
        for (let i = 0; i < this._videoCanvasesLength; i++) {
            this.videoCanvases[i].onResize(w, h);
        }
    }

    // set controller(contoller) {
    //     this._controller = contoller
    //     this._controller.addVoSignal.add(() => {

    //     })
    // }

    update() {
        this.boundUpdate();
    }

    getCanvasAt(index) {
        return this.videoCanvases[index].getCanvas();
    }

    getBuffersAt(index) {
        return this.videoCanvases[index].getBuffers();
    }

    getVideoAt(index) {
        return this.mediaSources[index].videoElement;
    }
}

export default VjManager;