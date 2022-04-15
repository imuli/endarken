var version = /Chrome\/([0-9.]+)/.exec(navigator.userAgent)[1];
var bgcolor = version < "80" && version < 100 ? 'black' : 'white';

var disabled = {};
var extras = {};
var updateLists = ((data) => {
	if (data.disabled)
		disabled = Object.fromEntries(data.disabled.map(x => [x, true]));
	if (data.extras)
		extras = data.extras;
});

chrome.storage.sync.get(['disabled','extras'], updateLists);
chrome.storage.onChanged.addListener((changes, area) => {
	if (area == 'sync') {
		updateLists({
			disabled: changes.disabled?.newValue,
			extras: changes.extras?.newValue,
		});
	}
});

chrome.contextMenus.removeAll();
chrome.contextMenus.create({
	title: "Toggle Disabled for Host.",
	contexts: ['browser_action'],
	onclick: () => chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
		var host = new URL(tabs[0].url).hostname;
		disable(host, !isDisabled(host));
	}),
});

var disable = (host, value = true) => {
	if (value)
		disabled[host] = true;
	else
		delete disabled[host];
	chrome.storage.sync.set({disabled: Object.keys(disabled)}, () => {});
};

var isDisabled = (host) => (disabled[host] || false);
var getExtras = (host) => (extras[host] || '');

var setExtra = (host, value) => {
	extras[host] = value;
	chrome.storage.sync.set({extras: extras}, () => {});
};

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

var darkscroll =
	'::-webkit-scrollbar {' +
  '  width: 1ex;' +
  '  height: 1ex;' +
  '}' +
  '::-webkit-scrollbar-button {' +
  '  display: none;' +
  '}' +
  'body::-webkit-scrollbar-thumb {' +
  '  background: #202020;' +
  '  border-radius: 0.5ex;' +
	'  width: 1ex;' +
	'  height: 1ex;' +
  '}' +
  'body::-webkit-scrollbar-thumb:hover {' +
  '  background: #606060;' +
  '}' +
  'body::-webkit-scrollbar-thumb:active {' +
  '  background: #808080;' +
  '}' +
  'body::-webkit-scrollbar-track {' +
  '  background: black;' +
  '}' +
  'body ::-webkit-scrollbar-track {' +
  '  background: none;' +
  '}' +
  '::-webkit-scrollbar-corner {' +
  '  background: transparent;' +
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
	insert(tab, invert);
}

function addExtras(tab) {
	var extras = getExtras((new URL(tab.url)).hostname);
	if (extras !== '') insert(tab, extras);
}

function lighten(tab){
	insert(tab, normal);
}

function doScrollbar(tab){
	insert(tab, darkscroll);
}

function whatToDo(changeInfo, tab) {
	if(changeInfo.status !== 'loading') return [];
	if(isDisabled(new URL(tab.url).hostname)) return ['scrollbar', 'extras'];
	if(tab.id in light) return [];
	return ['darken', 'scrollbar', 'extras'];
}

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab){
	whatToDo(changeInfo, tab).forEach(act => {
		switch(act) {
			case 'scrollbar': return doScrollbar(tab);
			case 'darken': return darken(tab);
			case 'extras': return addExtras(tab);
		}
	});
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
