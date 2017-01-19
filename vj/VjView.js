import './vj.scss';
// Vendor dependencies
import Marionette from 'backbone.marionette';
import Emitter from 'emitter';
import Utils from 'utils';
import VjUtils from './vj-utils';
// Core dependencies
// App dependencies
import template from './vj.ejs';

import Channel from 'channel';
import Playlist from 'playlist';
import Session from 'session';
import YoutubeService from 'youtubeService';
import SpotifyService from 'spotifyService';
import EchoService from 'echonestService';
import KnowledgeService from 'knowledgeService';
import ServerService from 'serverService';

//import VJ from './vj';
import VJManager from './vj-mediasource-manager';
import VjRenderer from './vj-fx-renderer';
import ControlPerameters from './vj-control-perameters';

import Recorder from './recorder'

const PLAY_VJ = "PLOnhHR5nulMPisi4X15rmPpEVp2Q-MIY0";
const TRENDING_TODAY = "PLbpi6ZahtOH7h9OULR1AVb4i8zo0ctwEr";
const MOON_P = "PLBm5UHsvUTFoHiOgZl8Ycn7Y3XySDSXuV";

// Define
class VjView extends Marionette.ItemView {

    ui() {
        return {
            btn: '.btn-primary',
            threeEl: '#three',
            videoInfo: '.videoInfo'
        }
    }

    events() {
        return {
            'click @ui.btn': 'btnClick',
            'mousemove': 'onMouseMove'
        }
    }

    template() {
        return template;
    }

    initialize() {
        this.gettingRelated = false;
        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth;
            this.windowHeight = window.innerHeight;
            if (this.vj) {
                this.vj.onWindowResize(this.windowWidth, this.windowHeight);
                this.renderer.onWindowResize(this.windowWidth, this.windowHeight);
            }
        });

        Channel.on('videostarted', (ytItem) => {
            this.gettingRelated = false;
            //this.ui.videoInfo[0].innerHTML = ytItem.snippet.title;
        }, this);


        Channel.on('audio:newtrack', (data) => {
            if (data.echo) {
                let _energy = data.echo.audio_summary.energy;
                ControlPerameters.playlistUtils.spread = _energy;
            }
        });

        this.boundUpdate = this._update.bind(this);
    }

    onShow() {
        return
        this.vj = new VJManager(this.el, {
            count: 1,
            playlists: [MOON_P],
            shufflePlaylist:true,
            maxVideoTime: 15,
            quality: {
                chooseBest: true,
                resolution: '360p'
            },
            verbose: false
        });

        this.renderer = new VjRenderer(this.ui.threeEl[0]);

        this.renderer.setTextures([
            this.vj.getCanvasAt(0)
        ]);

        this.windowWidth = window.innerWidth;
        this.windowHeight = window.innerHeight;

        this._recorder = new Recorder(this.ui.threeEl[0])
        console.log(this._recorder);
        this._recorder.start()

        //this.boundUpdate();
        //this.vj = new VJ(this.el, this.ui.threeEl[0]);
        // this.imagePlayer = new ImagePlayer({
        //   el: this.el
        // });

        // ServerService.getManifest().then(data => {
        //   let urls = Playlist.getUrlsByType(data, 'minerals');
        //   this.imagePlayer.setImages(urls);
        //   this.imagePlayer.init();
        //   window.requestAnimationFrame(u);
        // });

        // YoutubeService.playlistItems({
        //     playlistId: TRENDING_TODAY
        //   })
        //   .then(results => {
        //     console.log(results);
        //     this.defaultPlaylistItems = results;
        //     this._getNext();
        //   });
    }

    onMouseMove(e) {
        if (this.gettingRelated) {
            return;
        }
        let y = e.pageY / this.windowHeight;
        let x = e.pageX / this.windowWidth;
        if (y > .8 && x < 0.2) {
            this.gettingRelated = true;
           // Channel.trigger('addrelatedtocurrent');
        } else {
            if (y > .8 && x > 0.8) {
                this.gettingRelated = true;
              //  Channel.trigger('adddeeper');
            }
        }
    }

    setAudioAnalyzeVo(vo) {
        ControlPerameters.analyzeVo = vo;
    }

    update() {
        this.vj.update();
        this.renderer.update();
    }

    _update() {
        this.vj.update();
        this.renderer.update();
        this.requestId = window.requestAnimationFrame(this.boundUpdate);
    }


    // _getNext(id) {
    //   let self = this;
    //   let data;

    //   console.log("Requesting next", id);
    //   if (!id) {
    //     data = this.defaultPlaylistItems;
    //     var item = Utils.getRandom(data.items);
    //     var vId = Utils.getIdFromItem(item);
    //     return this._getSidxAndAdd(vId, this.vj.addVo);
    //   } else {
    //     return YoutubeService.relatedToVideo({
    //         part: 'snippet',
    //         id: id,
    //         order: 'viewCount'
    //       })
    //       .then(data => {
    //         var item = Utils.getRandom(data.items);
    //         console.log(item);
    //         var vId = Utils.getIdFromItem(item);
    //         this._getTopicDetails(item.snippet.title, vId).then(value => {
    //           console.log(value);
    //         });
    //         return this._getSidxAndAdd(vId);
    //       });
    //   }
    // }

    // _getSidxAndAdd(vId) {
    //   return ServerService.getSidx(vId).then((data) => {
    //     let vo = VjUtils.createVo(data);
    //     console.log("Adding ", vo.id);
    //     this.vj.addVo(vo);
    //   }).catch(err => {
    //     console.log(err)
    //     self._getNext(id);
    //   });
    // }


};

// Export
export default VjView
