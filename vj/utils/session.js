'use strict';
import Cookies from 'js-cookie';
// Define
const Session = {
	youtube:{
		auth:{
			access_token:Cookies.get('rad-youtubeAccess')
		}
	},
	spotify:{
		auth:{
			access_token:Cookies.get('rad-spotifyAccess')
		}
	}
};

// Export
export default Session;
