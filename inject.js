function Color(){
	this.vec = [];
	for(var i = 0; i < arguments.length; i++){
		this.vec.push(arguments[i]);
	}
}
Color.prototype.toString = function(){
	return this.rgb();
}
Color.prototype.rgb = function(){
    return 'rgb(' + this.vec.join(", ") + ')';
}
Color.prototype.html = function(){
    return '#' + this.vec.slice(0,3).map(function(n){
		return ("0" + n.toString(16)).slice(-2);
	}).join("");
}
Color.vec = function(vec){
	return new (Function.prototype.bind.apply(Color, [null].concat(vec)));
}
Color.rgb = function(s){
	return this.vec(s.match(/[0-9]+/g).map(function(s){return parseInt(s)}));
}
Color.html = function(s){
	return this.vec(s.match(/[0-9a-f][0-9a-f]/g).map(function(s){return parseInt("0x" + s)}));
}

var colors = {
	default: {
		back:	Color.html('#000000'),
		fore:	Color.html('#839496'),
	},
	special: {
		back:	Color.html('#002b36'),
		fore:	Color.html('#93a1a1'),
	},
	yellow:	Color.html('#b58900'),
	orange:	Color.html('#cb4b16'),
	red:	Color.html('#dc322f'),
	magenta:	Color.html('#d33682'),
	violet:	Color.html('#6c71c4'),
	blue:	Color.html('#268bd2'),
	cyan:	Color.html('#2aa198'),
	green:	Color.html('#859900'),
};

function classify(rule){
	var type = 'special';
	if(rule.selectorText === undefined)
		type = "unknown";
	else if(rule.selectorText.match(/html|body|header|container/)){
		type = 'default';
	} else if(rule.selectorText == '.kwd'){
		type = "default";
	}
	return [type, rule];
}

function map(a, f){
	if(a == null) return [];
	var r = [];
	for(var i = 0; i < a.length; i++){
		r.push(f(a[i], i, a));
	}
	return r;
}

function isPropertySet(property){
	switch(property){
	case '':
	case undefined:
	case null:
	case 'initial':
	case 'inherit':
		return false;
	}
	return true;
}

function rules(){
	var rules = [];
	function addRule(rule){
		if(rule.cssRules){
			ruleList(rule);
		} else {
			rules.push(rule);
		}
	}
	function ruleList(sheet){
		map(sheet.cssRules, addRule);
	}
	map(document.styleSheets, addRule);
	return rules;
}

function colorize(){
	rules().map(classify).map(function(a){
		var type = a[0];
		var rule = a[1];
		if(type == 'unknown') return;

		if(isPropertySet(rule.style.backgroundColor)){
			rule.style.backgroundColor = colors[type].back;
		}
		if(isPropertySet(rule.style.boxShadow)){
			rule.style.backgroundColor = colors[type].back;
		}
		if(rule.style.backgroundImage.match(/gradient/)){
			rule.style.background = colors[type].back;
		}

		if(isPropertySet(rule.style.color)){
			rule.style.color = colors[type].fore;
		}
	});
}

document.addEventListener("DOMContentLoaded", function(event){
	colorize();
});
