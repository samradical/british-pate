import _ from 'lodash';
import Utils from 'utils';
import path from 'path';
// Define
const Playlist = (() => {

    function getUrlsByType(data, type) {
        let urls = [];
        _.each(data, (obj)=>{
            if(obj.type === type){
                if(obj.url.indexOf('-r') <0){
                    urls.push(obj.url);
                }
            }
        });
        return urls;
    }

    return {
        getUrlsByType: getUrlsByType
    }
})();

// Export
export default Playlist;