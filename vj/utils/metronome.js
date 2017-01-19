import sono from '@stinkdigital/sono';
import Emitter from './emitter'
import Dilla from 'dilla';

export default class Metronome {
    constructor(options) {
        var dilla = new Dilla(sono.context, options);
        var high = {
            'position': '*.1.01',
            'freq': 440,
            'duration': 15
        };
        var low = { 'freq': 330, 'duration': 15 };

        dilla.set('metronome', [
            high, ['*.>1.01', low]
        ]);

        var _c = 0
        dilla.on('step', function(step) {
            if (step.event !== 'start') {
                return
            }
            let _position = step.position.split('.')
            if (_c % options.beatsPerBar === 0) {
                Emitter.emit('metronome:bar')
                _c = 0
            }
            Emitter.emit('metronome:quater', _c)
            _c++
        })
        dilla.start()
    }
}