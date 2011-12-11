function Template(source, manager) {
	this._source = source;
	this._helpers = manager._helpers;
	this._template = ["var tf=function(obj){var _data_=[],_i_,_t_=[];function _print_(a){_data_.push(a)}for(_i_ in obj)_t_.push('var '+_i_+'='+JSON.stringify(obj[_i_])+';');_t_=_t_.join('');eval(_t_);"];
	function quote_escape(s) {
		return s.replace(/\\/g,"\\x5c").replace(/\r/g,"").replace(/\n/g,"\\n").replace(/\//g,"\\x2f").replace(/'/g,"\\x27").replace(/"/g,"\\x22");
	}
	
	while(source.length > 0) {
		// Get any normal text until a tag
		var nextTag = source.indexOf('<%');
		var nextEnd=source.indexOf('%>', nextTag);
		
		if(nextTag == -1) {
			if(nextEnd != -1) throw 'Unmatched end tag at position ' + nextEnd;
			this._template.push("_print_('" + quote_escape(source) + "');");
			source = '';
		} else {
			var t = quote_escape(source.substr(0, nextTag));
			if(t.length>0) {
				this._template.push("_print_('"+ t +"');");
			}
			var s = source.substr(nextTag + 2, nextEnd - nextTag - 2);
			var m = s.match(/\^ (\w+)/);
			if(m) {
				try {
					m=manager._templates[m[1]]._source;
				} catch(e) {
					//console.debug(m[1] + 'template not loaded');
					throw e;
				}
				source=m+source.substr(nextEnd+2);
				continue;
			}
			if(s[0] == '=') {
				s = s.substr(1);
				this._template.push('_print_(' + s + ');');
			} else {
				// Add code to template
				this._template.push(s);
			}
			source = source.substr(nextEnd + 2);
		}
	}

	this._template.push("return _data_.join('')}");
	this._temptext = this._template.join('');

	try {
		eval(this._temptext);
		this._tfunc = tf;
		delete this._temptext;
	} catch(e) {
		window.tmp_dbg = this._temptext;
		//console.error("Template build error - check tmp_dbg");
		throw e;
	}
}
Template.prototype.render = function(vars) {
	if(!vars) vars={};
	for(var i in this._helpers) {
		vars[i] = this._helpers[i];
	}
	try {
		return this._tfunc(vars);
	} catch(e) {
		window.tmp_dbg = this._tfunc;
		//console.error("Template render error, check tmp_dbg - ", e);
		throw 'tmp render error';
	}
}

function TemplateManager(helpers) {
	this._templates = {};
	this._helpers = helpers;
}
TemplateManager.prototype.add = function(name, source, replace) {
	if(!this.has(name) || replace) {
		this._templates[name] = new Template(source, this);
	}
}
TemplateManager.prototype.has = function(name) {
	return (name in this._templates);
}
TemplateManager.prototype.render = function(name, vars) {
	try {
		if(this.has(name)) {
			return this._templates[name].render(vars);
		} else return '';
	} catch(e) {
		console.debug('Error rendering', name, vars);
	}
}