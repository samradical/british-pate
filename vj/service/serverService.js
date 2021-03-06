import $ from 'jquery';
import Q from 'bluebird';
import _ from 'lodash';
import Utils from '../utils/utils';
import Socket from '../socket/socket';
import QS from 'query-string';
import BlueBirdQueue from './bluebirdQueue';
import YoutubeSocket from '@samelie/dash-player-youtube-socket'

'use strict';

let _requestQueue = new BlueBirdQueue({
    concurrency: 1
});

const youtubeSocket = new YoutubeSocket(Socket)

const MOON_BASE = "https://s3-eu-west-1.amazonaws.com/rad-moon/";

const DEFAULTS = {
    maxResults: 50
};


const _addRequest = function(prom) {
    _requestQueue.add(prom);
    _requestQueue.start();
    return prom;
}

const _sidxKey = (id, options = {}) => {
    let _audioonly = options.audioonly || false
    return `${id}_${_audioonly}`
}

const _createError = (message) => {
    console.log(message);
    let proxiedError = new Error(message);
    return proxiedError
}


const ServerService = {

    youtubeSocket:youtubeSocket,

    sidxs: {

    },

    getManifest() {
        return fetch(`${MOON_BASE}rad-moon-manifest`).then(response => {
            return response.json();
        });
    },

    getNextSidx(id) {
        let p = Q.resolve($.get(SERVER_BASE + 'getNextVideoSidx', {
            id: id
        }));
        return _addRequest(p);
    },

    getNextYoutubeSearch(id, options) {
        let p = Q.resolve($.get(SERVER_BASE + 'getNextVideo', {
            id: id,
            ...options
        }));
        return _addRequest(p);
    },

    getNextYoutubeFromPlaylist(obj, options) {
        let p = Q.resolve($.get(SERVER_BASE + 'getNextVideoFromPlaylist', {
            ...obj,
            ...options
        }));
        return _addRequest(p);
    },

    getSidx(id, options) {
        var type = options.audioonly ? 'audio' : 'video'
        return youtubeSocket.getManifest(
                type,
                id,
                null,
                {
                    audioOnly:options.audioonly
                }
            )
            .then(results =>
            {
                return results
            })


        let p = new Q((resolve, reject) => {
            let _key = _sidxKey(id, options)
            if (ServerService.sidxs[_key]) {
                resolve(ServerService.sidxs[_key])
            } else {
                $.get(SERVER_BASE + 'getVideoSidx', {
                    id: id,
                    ...options
                }).then((data) => {
                    if (data.status === 500) {
                        reject(new Error(id, null));
                    } else {
                        let _d
                        if (data.url) {
                            _d = data
                        } else {
                            _d = data[0]
                        }
                        if (!_d) {
                            reject(new Error(id, null));
                        } else {
                            _d.videoId = id;
                            ServerService.sidxs[_key] = _d
                            resolve(_d);
                        }
                    }
                });
            }
        });
        return p
            //return _addRequest(p);
    },

    playlistItems(options) {

        return youtubeSocket.youtube.playlistItems({
                playlistId: options.playlistId,
                force: true,
            })
            .then(results => {
                return results
            })

        /*let params = QS.stringify(_.assign({}, {
            part: 'snippet',
            videoDuration: 'any',
            maxResults: 50,
            type: 'video',
            safeSearch: 'none'
        }, DEFAULTS, options));

        return fetch(`${SERVER_BASE}youtube/playlistItems?${params}`).then(response => {
            return response.json();
        });*/
    },

    channelUploadsFromComments(results, userProfile, existingIds) {
        let channelIds = [];
        _.each(results.items, (item) => {
            //Uncaught (in promise) TypeError: Cannot read property 'value' of undefined(…)
            let channelId = item.snippet.topLevelComment.snippet.authorChannelId.value;
            channelIds.push(channelId);
        });
        let mapped = Q.map(channelIds, (chId) => {
            let chUpload = this.channelUploads(chId)
                .then(data => {
                    if (data.length) {
                        _.each(data, (item) => {
                            //is not a likes video
                            let vId = Utils.extractVideoIdFromUpload(item.img);
                            let _views = Utils.extractViewsFromScrape(item.content);
                            if (existingIds.indexOf(vId) < 0) {
                                if (item.content.indexOf('by ') === -1) {
                                    userProfile.uploads.push({ videoId: vId, views: _views });
                                } else {
                                    userProfile.likes.push({ videoId: vId, views: _views });
                                }
                            } else {
                                console.log(`Skip, has ${vId}`);
                            }
                        });
                        if (channelIds.indexOf(chId) > 5 && !userProfile.uploads.length) {
                            console.log("Couldn't find any uploads, using likes");
                            return chUpload.cancel();
                        } else if (userProfile.uploads.length) {
                            console.log(`Found uploads of ${chId}`);
                            return chUpload.cancel();
                        }
                        return data;
                    }
                    console.log(`No uploads on ${chId}`);
                    return data;
                });
            return chUpload;
        }, { concurrency: 1 });
        return mapped;
    },

    channelUploads(channelId) {
        let p = new Q((resolve, reject) => {
            $.get(SERVER_BASE + 'channelUploads', {
                channelId: channelId
            }).then((data) => {
                resolve(data);
            });
        });
        return _addRequest(p);
    }

};
export default ServerService;
