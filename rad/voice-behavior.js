import _ from 'lodash'
import Proxxy from '../vj/utils/proxy';
export default class VoiceBehavior {
    constructor(audioController) {
        this._audioController = audioController
        this._proxies = {}
        _.forIn(this._audioController.effects, (effect) => {
            this._proxies[effect.type] = new Proxxy(effect, (prop, val, proxy) => {
                this._audioController.effects[proxy.type][prop] = val
            }).proxy
        })
    }

    frequency(type, norm, min = 500) {
    	let _f = min + this._audioController.effects[type].defaults.value * norm
        this._proxies[type].set(_f)
    }

}