import SocketIo from './vj/socket/socket';

export default class SocketRecord {
    constructor(fps) {
        this.then = 0
        this.interval = 1000 / fps
        this.allowSave = true
        this._isStopped = true

        SocketIo.on('recorder:image:saved', () => {
            this.allowSave = true
        })

        SocketIo.on('recorder:started', (path) => {
            this._isStopped = false
        })

        SocketIo.on('recorder:video:saved', (path) => {
            console.log(path);
        })

    }

    stop(options = { videoWidth: 640, videoHeight: 360 }) {
        this._isStopped = true
        SocketIo.emit('recorder:video:save', options.videoWidth, options.videoHeight)
    }

    start() {
        SocketIo.emit('recorder:start')
    }

    record(canvas) {
        if (this._isStopped) {
            return
        }
        let now = performance.now()
        let delta = now - this.then;

        if (delta > this.interval && this.allowSave) {
            this.then = now - (delta % this.interval);
            this.allowSave = false

            let jpegUrl = canvas.toDataURL("image/jpeg");
            SocketIo.emit('recorder:image:save', jpegUrl)
        }
    }

}