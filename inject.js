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
		color:	Color.html('#777777'),
		border: Color.html('#2b2b2b'),
	},
	special: {
		back:	Color.html('#2b2b2b'),
		color:	Color.html('#cfcfcf'),
		border: Color.html('#777777'),
	},
	link: {
		back:	Color.html('#000000'),
		color:	Color.html('#038a29'),
		border: Color.html('#2b2b2b'),
	},
};

function classify(rule){
	var type = 'special';
	var it;
	if(rule.selectorText !== undefined) {
		it = rule.selectorText;
	} else if(rule.tagName !== undefined) {
		it = rule.tagName;
	} else {
		return ["unknown", rule];
	}
	if(it.match(/(^| )a[^ ]*(,|$)/)) {
		type = 'link';
	} else {
		type = 'default';
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
	map(document.querySelectorAll('*'), function(node){
		if(node.style.length > 0)
			rules.push(node);
	});
	return rules;
}

function colorize(){
	rules().map(classify).map(function(a){
		var type = a[0];
		var rule = a[1];
		if(type == 'unknown') return;

		function changeColors(to){
			return function(attr){
				if(isPropertySet(rule.style[attr])){
					rule.style[attr] = rule.style[attr].replace(
							/rgba?\([0-9., ]+\)|^[a-z]+$|#[0-9a-fA-F]+/g,
							colors[type][to]);
				}
			}
		}

		[	"borderColor", "borderLeftColor", "borderRightColor",
			"borderTopColor", "borderBottomColor", "boxShadow",
		].map(changeColors('border'));

		[	"color",
		].map(changeColors('color'));

		[	"background", "backgroundColor", "backgroundImage",
		].map(changeColors('back'));

		[	"textShadow",
		].map(function(attr){
			if(isPropertySet(rule.style[attr])){
				rule.style[attr] = "";
			}
		});

		if(rule.style.backgroundImage.match(/^url\((data|.*\.jpe?g)/)){
			rule.style.backgroundImage = "";
		}
	});
}

document.addEventListener("DOMContentLoaded", function(event){
	colorize();
});
