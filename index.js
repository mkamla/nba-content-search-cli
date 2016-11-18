var http = require('http'),
	stdin = process.stdin,
	model = {},
	settings = {
		arguments: function(){
			var array = [];

			process.argv.forEach(function(val,key){
				if(key > 1){
					array.push(val);
				}
			});
			
			return array.join(' ');
		}
	},
	helper = {
		pad: function(pad, str, padLeft){
			if(typeof str === 'undefined'){
				return pad;
			}

			if(padLeft){
				return (pad + str).slice(-pad.length);
			}else{
				return (str + pad).substring(0, pad.length);
			}
		}
	};

model.request = function(string,callback){
	var params = {
		hostname: 'www.nba.com',
		path: '/rockets/etowah_newsblock/autocomplete/'+encodeURIComponent(string),
		type: 'GET',
		headers: {
			'Content-type': 'application/json'
		}
	};

	var request = http.request(params,function(rsp){
		var data = '';

		rsp.on('data',function(chunk){
			data += chunk;
		});

		rsp.on('end',function(){
			if(callback && typeof callback === 'function'){
				callback(JSON.parse(data));
			}
		});
	});

	request.end();
};

model.formatNodes = function(data){
	var array = [];

	for(var i in data){
		array.push({
			nid: model.getNID(i),
			title: model.getTitle(data[i]),
			date: model.getTimestamp(data[i])
		});
	}

	return array;
};

model.getNID = function(key){
	var index = key.indexOf('(');

	if(index !== -1){
		return key.substring(index+1,key.length - 1);
	} else {
		return '';
	}
};

model.getTitle = function(value){
	var index = value.indexOf(' : '),
		title = value.substring(0,value.length - (value.length - index));

	return title = formatTitle(title,30);
};

model.getTimestamp = function(value){
	var index = value.indexOf(' : ');

	if(index !== -1){
		return new Date(value.substring(index+3));
	} else {
		return new Date();
	}
};

var formatTitle = function(title,maxLength,ellipsis){
	var length = maxLength,
		maxLength = (ellipsis === false)?maxLength:maxLength-3,
		truncTitle = title.substring(0,maxLength);

	if(ellipsis !== false){
		truncTitle += '...';
	}

	if(title.length < length){
		return helper.pad(Array(length+1).join(' '),title);
	} else {
		return truncTitle;
	}
};

var formatDate = function(d){
	var dateString = d+'',
		lastIndex = dateString.lastIndexOf(':');

	return dateString.substring(0,lastIndex+3);
}

var listNodes = function(nodes){
	for(var i in nodes){
		console.log(nodes[i].nid+' \t '+nodes[i].title+' \t '+formatDate(nodes[i].date));
	}
};

var keyHandler = function(key){
	switch (key){
		case '\u0003':
			process.exit;
			break;
		default:
			process.stdout.write(key);
			break;
	}
};

var search = function(){

	console.log(settings.arguments());
	model.request(settings.arguments(),function(rsp){
		listNodes(model.formatNodes(rsp));
	});
}.call();

var init = function(){
	stdin.setRawMode(true);
	stdin.resume();
	stdin.setEncoding('utf8');

	stdin.on('data',keyHandler);
}.call();