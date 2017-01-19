import TweenLite from 'gsap'
export default class ChromaBehavior {
    constructor(target) {
        this._keyColor = {
            val: 0
        }
        this._target = target
        this._updateBound = this._updateColor.bind(this)
    }

    updateUniform(key, val) {
        this._target.uniforms[key] = val
    }

    changeKeyColor(k, amp, dur = 20) {
        TweenLite.to(this._keyColor, dur, {
            val: k,
            overwrite: 1,
            onUpdate: this._updateBound
        })
    }

    _updateColor() {
        this._target.uniforms['uKeyColor'] = this._keyColor.val
    }

}