import _ from 'lodash'
import ProxyP from 'proxy-polyfill'
'use strict'
export default class Proxxy {
    constructor(options, callback) {
        this._options = options
        this._proxy = this._observe(this._options, callback)
    }

    get proxy() {
        return this._proxy
    }

    _observe(o, fn) {
        var _self = this
        function buildProxy(prefix, o) {
            return new Proxy(o, {
                set(target, property, value) {
                    // same as before, but add prefix
                    fn(prefix + property, value, _self.proxy);
                    target[property] = value;
                    return true
                },
                get(target, property) {
                    // return a new proxy if possible, add to prefix
                    let out = target[property];
                    if (out instanceof Object) {
                        return buildProxy(prefix + property + '.', out);
                    }
                    return out; // primitive, ignore
                },
            });
        }

        return buildProxy('', o);
    }
}