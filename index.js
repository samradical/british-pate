import BritishPate from './british-pate'
let _britshPate
if (document.body) {
    _init();
} else {
    window.addEventListener('DOMContentLoaded', _init);
}


function _init(){
    var _infoEl = document.getElementById('info')
    _infoEl.innerHTML += '<section class="section" id="launch"><img class="launch" src="https://storage.googleapis.com/samrad-british-pate/assets/img/uwot.png"></img></section>'
    var l = document.getElementById('launch')
    l.addEventListener('click', ()=>{
        document.body.removeChild(_infoEl)
        _britshPate = new BritishPate()
    })
}
