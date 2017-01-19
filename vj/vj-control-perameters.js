const P = (() => {
    let C = {
        midi: {},
        playlistUtils: {
            spread: 0.4
        },
        rockIntensity: 0.23,
        analyzeVo: undefined
    }

    C.time = 1
    C.renderer = {
        blendMode: 1,
        rockOpacity: 1,
        blendOpacity: 1
    }

    C.video = {
        stepBack: 1
    }

    C.sources = [{
        color: {
            uSaturation: 1,
            uR: { value: 1. },
            uG: { value: 1. },
            uB: { value: 1. },
            uBrightness: 0.01,
            uContrast: 0,
            uHue: 1,
        },
        shapeMix: {
            uSize: 1,
            uIntensity: 1
        },
        canvas: {
            rewind: 1
        }
    }]

    return C
})();

export default P;