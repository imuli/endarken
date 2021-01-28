var version = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
var bgcolor = version < "80" ? 'black' : 'white';
var getExtras = (host) => ({
	'trello.com': '#trello-root { background-image: unset !important; }\n',
	'harrypotter.fandom.com': 'body { background-color: unset !important; } body::after { background-image: unset !important; } body::before { background-image: unset !important; }\n',
	'www.facebook.com': 'html#facebook { overflow-y: visible !important; }\n',
}[host] || '');
var invert =
	'html {' +
		'filter: invert(100%) !important;' +
		'background: '+bgcolor+' !important;' +
	'}\n' +
	'img {' +
		'filter: invert(100%);' +
	'}\n' +
	'video {' +
		'filter: invert(100%);' +
	'}\n';

var normal =
	'html {' +
		'filter: unset !important;' +
		'background: unset !important;' +
	'}\n' +
	'img {' +
		'filter: unset;' +
	'}' +
	'video {' +
		'filter: unset;' +
	'}';

var light = {};

function insert(tab, code){
	if(tab.url.startsWith('chrome')) return;
	chrome.tabs.insertCSS(tab.id, {
		code: code,
		matchAboutBlank: true,
		runAt: 'document_start',
	});
}

function darken(tab){
	insert(tab, invert + getExtras((new URL(tab.url)).hostname));
}

function lighten(tab){
	insert(tab, normal);
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	if(changeInfo.status == 'loading'){
		if(!(tab.id in light)){
			darken(tab);
		}
	}
});
chrome.browserAction.onClicked.addListener(function(tab){
	if(tab.id in light){
		delete light[tab.id];
		darken(tab);
	} else {
		light[tab.id] = true;
		lighten(tab);
	}
});
