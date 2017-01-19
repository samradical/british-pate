import Q from 'bluebird';
import _ from 'lodash';

import ControllerBase from './vj-controller-base';
import Utils from '../utils/utils';
import Emitter from '../utils/emitter';

import ServerService from '../service/serverService';
import VjUtils from '../vj-utils';
class VideoController extends ControllerBase {

    constructor(options) {
        super()
        this._options = options
        if (options.isAudio) {
            this._options.audioonly = false
        }

        this.youtubeItems = [];
        this.youtubeItemIds = [];

        this._barCounter = 0

        if (!options.isSlave) {
            Emitter.on('metronome:bar', () => {
                if (this._barCounter % this._options.playNewEveryBars === 0) {
                    this._setRandomVideoIndex()
                }
                this._barCounter++
            })
        }
    }

    addVo() {
        setTimeout(() => {
            this._nextVideo()
        }, 1000)
    }

    addVoFromPhrase(phrases) {
        if (phrases.length) {
            Q.map(phrases, (phrase) => {
                    let _videoId = phrase.vo.videoId
                    return this._getSidx(_videoId)
                        .then(sidx => {
                            let _startIndex = phrase.refIndexs[0]
                            let _endIndex = phrase.refIndexs[phrase.refIndexs.length - 1]
                            return VjUtils.combineRefs(
                                sidx,
                                _startIndex,
                                _endIndex, {
                                    videoId: _videoId,
                                    //seekValue: phrase.seekValue
                                }
                            )
                        })
                }, { concurrency: 1 })
                .then(vos => {
                    vos.forEach(vo => {
                        return this._mediaSource.addVo(vo)
                    })
                })
                .finally()
        }
    }

    _onEndingSignal() {
        console.log("Ending");
        this._nextVideo()
    }

    _nextVideo(sub = {}) {
        return new Q((resolve, reject) => {
            return this._getPlaylistVideoIds()
                .then(playlistVideoIds => {
                    if (!this._currentRef) {
                        this._setRandomVideoIndex()
                    }
                    return this._getSidx(this.currentVideoId)
                        .then(sidx => {
                            let _references = this._currentSidx.sidx.references
                            let _indexOfCurrentRef = _references.indexOf(this._currentRef) || 0
                            let _refIndex = _indexOfCurrentRef + 1

                            let _ref = _references[_refIndex] || _references[0]
                            let _vo = VjUtils.voFromRef(sidx, _ref);
                            this._currentRef = _ref
                            return this._mediaSource.addVo(_vo)
                        }).finally()
                })
        })
    }

    _updateYoutubeResults(data) {
        let _ids = [];
        if (this._options.shufflePlaylist) {
            Utils.shuffle(data.items);
        }
        _.each(data.items, (item) => {
            _ids.push(Utils.getIdFromItem(item));
        });
        this.youtubeItems = [...this.youtubeItems, ...data.items];
        this.youtubeItemIds = [...this.youtubeItemIds, ..._ids];
    }

    _getSidxAndAdd(vId) {
        return this._getSidx(vId)
            .then((sidx) => {
                this.sidxResults = [...this.sidxResults, sidx];
                return this._createReferenceIndexFromResults([sidx]);
            });
    }

    _createReferenceIndexFromResults(results) {
        return results
        _.each(results, (item) => {
            this.playlistUtils.mix(item, this.playlistReferenceIndex, this._options);
        });
        return this.sidxIndexReferences;
    }

    _getSidx(vId, options = {}) {
        options.quality = this._options.quality || '360p'
        options.audioonly = this._options.audioonly
        return ServerService.getSidx(vId, options)
            .then((sidx) => {
                this._currentSidx = sidx
                return this._currentSidx
            })
    }

    _getPlaylistVideoIds() {
        return new Q((resolve, reject) => {
            if (this.youtubeItemIds.length) {
                resolve(this.youtubeItemIds)
            } else {
                return Q.map(this._options.playlists, (id) => {
                    return ServerService.playlistItems({
                            playlistId: id
                        })
                        .then(results => {
                            this._updateYoutubeResults(results);
                            resolve(this.youtubeItemIds)
                        });
                }, {
                    concurrency: 3
                })
            }
        });
    }

    _setRandomVideoIndex() {
        this.currentVideoIndex = Utils.getRandomNumberRange(this.youtubeItemIds.length - 1)
        return this.currentVideoIndex
    }

    set currentVideoIndex(i) {
        this._currentVideoIndex = i
    }

    get currentVideoIndex() {
        return this._currentVideoIndex || 0
    }

    set currentVideoId(id) {
        this._currentVideoId = id
    }

    get currentVideoId() {
        return this.youtubeItemIds[this.currentVideoIndex]
    }

    get options() {
        return this._options
    }

    _getRandomVideoId() {
        return this.youtubeItemIds[Math.floor(Math.random() * this.youtubeItemIds.length - 1)]
    }
}

export default VideoController;
