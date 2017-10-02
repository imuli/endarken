var invert =
	'body::after {' +
		'display: inline;' +
		'content: " ";' +
		'pointer-events: none;' +
		'position: fixed;' +
		'top: 0;' +
		'bottom: 0;' +
		'left: 0;' +
		'right: 0;' +
		'z-index: 999999;' +
		'backdrop-filter: invert(100%) hue-rotate(180deg);' +
	'}\n' +
	'img {' +
		'filter: invert(100%) hue-rotate(180deg);' +
	'}\n' +
	'video {' +
		'filter: invert(100%) hue-rotate(180deg);' +
	'}\n';

var normal =
	'body::after {' +
		'display: none;'
	'}\n' +
	'img {' +
		'filter: unset;' +
	'}' +
	'video {' +
		'filter: unset;' +
	'}';

var message =	'endarken uses a new CSS property "backdrop-filter".\n\n' +
		'Please enable Experimental Web Platform features.\n' +
		'Or remove this extension.\n';

var light = {};

function darken(id){
	console.log("darkening " + id);
	chrome.tabs.insertCSS(id, {
		code: invert,
		matchAboutBlank: true,
		runAt: 'document_start',
	});
}

function lighten(id){
	console.log("lightening " + id);
	chrome.tabs.insertCSS(id, {
		code: normal,
		matchAboutBlank: true,
		runAt: 'document_start',
	});
}

if('backdropFilter' in document.body.style){
	chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
		if(changeInfo.status == 'loading'){
			if(!(tab.id in light)){
				darken(tab.id);
			}
		}
	});
	chrome.browserAction.onClicked.addListener(function(tab){
		if(tab.id in light){
			delete light[tab.id];
			darken(tab.id);
		} else {
			light[tab.id] = true;
			lighten(tab.id);
		}
	});
} else {
	var url;
	if(confirm(message)){
		url = "chrome://flags/#enable-experimental-web-platform-features";
	} else {
		url = "chrome://extensions/#" + document.location.hostname;
	};
	chrome.tabs.create({
		active: true,
		url: url
	});
}
