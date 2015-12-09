
var lastDetails;
chrome.webRequest.onHeadersReceived.addListener(function(details){
	if(details.type != "stylesheet") return;
	if(!details.responseHeaders) return;
	details.responseHeaders.push({
		name: "Access-Control-Allow-Origin",
		value: "*",
	});
	lastDetails = details;
	return {responseHeaders: details.responseHeaders};
}, {urls: ['<all_urls>']}, ['blocking', 'responseHeaders']);
