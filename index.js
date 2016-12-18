var http = require('http'),
	cp = require('copy-paste'),
	spawn = require('child_process').exec,
	readline = require('readline'),
	stdin = process.stdin,
	rl = readline.createInterface(process.stdin,process.stdout),
	settings = (function(){
		var array = [];

		process.argv.forEach(function(val,key){
			if(key > 1){
				array.push(val);
			}
		});
		
		return array;
	}()),
	model = {},
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

model.nodes = [];
model.searchString = '';

model.setTeam = function(team){
	model.team = team;
};

model.request = function(string,callback){
	var params = {
		hostname: 'www.nba.com',
		path: '/'+model.team+'/etowah_newsblock/autocomplete/'+encodeURIComponent(string),
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
			'nid': model.getNID(i),
			'title': model.getTitle(data[i]),
			'date': model.getTimestamp(data[i])
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
		return ''+new Date(value.substring(index+3));
	} else {
		return ''+new Date();
	}
};

model.getNodePropName = function(index){
	var count = 0,
		propName = false;

	if(model.nodes[0]){
		for(var i in model.nodes[0]){
			if(count === index){
				propName = i;
			}
			count++;
		}
	}

	return propName;
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

var listNodes = function(position){
	var nodes = new Object(model.nodes),
		avoid = 99;
		
	process.stdout.write('\n\n');

	for(var i in nodes){
		var printStyle = '\x1b[0m';

		if(position && position.y > -1){
			if(position.y.toString() === i){
				//green
				printStyle = '\x1b[32m';

				if(position.x !== -1){
					var prop = model.getNodePropName(position.x);
					avoid = position.y;

					if(prop !== false){	
						for(var x in nodes[i]){
							if(x === prop){
								//inverse
								process.stdout.write('\x1b[34m'+model.nodes[i][x]+'\t');
							} else {
								process.stdout.write(printStyle+model.nodes[i][x]+'\t');
							}
						}
					}
				}
			}
		}

		//print
		process.stdout.write(printStyle);
		for(var x in nodes[i]){
			if(avoid === parseInt(i,10)){
				process.stdout.write('\x1b[0m');
			} else {
				process.stdout.write(model.nodes[i][x]+'\t');
			}
		}
		process.stdout.write('\n');
	}
};

var keyHandler = function(str,key){
	if(key.ctrl && key.name === 'c'){
		rl.pause();
		readline.moveCursor(process.stdin,1,0);
		readline.clearLine(process.stdin,0);
		readline.clearScreenDown(process.stdin);
		process.exit(0);
	} else {
		switch (key.name){
			case 'backspace':
				rl.pause();
				//set new search string
				model.searchString = model.searchString.substr(0,model.searchString.length-1);
				//clear entire search line
				readline.clearLine(process.stdin,-1);
				//move cursor to origin
				readline.moveCursor(process.stdin,-(model.searchString.length+2),0);
				console.log(model.searchString);
				readline.moveCursor(process.stdin,model.searchString.length,-1);

				search(model.searchString);
				break;
			case 'down':
				navigate.down();
				readline.clearScreenDown(process.stdin);
				listNodes(navigate.position());
				readline.moveCursor(process.stdin,model.searchString.length,-(model.nodes.length+2));
				break;
			case 'up':
				navigate.up();
				readline.clearScreenDown(process.stdin);
				listNodes(navigate.position());
				readline.moveCursor(process.stdin,model.searchString.length,-(model.nodes.length+2));
				break;
			case 'right':
				readline.moveCursor(process.stdin,-1,0);
				navigate.right();
				readline.clearScreenDown(process.stdin);
				listNodes(navigate.position());
				readline.moveCursor(process.stdin,model.searchString.length,-(model.nodes.length+2));
				break;
			case 'left':
				readline.moveCursor(process.stdin,1,0);
				navigate.left();
				readline.clearScreenDown(process.stdin);
				listNodes(navigate.position());
				readline.moveCursor(process.stdin,model.searchString.length,-(model.nodes.length+2));
				break;
			case 'space':
				model.searchString += ' ';
				search(model.searchString);
				break;
			case 'return':
				var index = navigate.position().y;

				readline.moveCursor(process.stdin,0,-1);
				rl.pause();
				
				if(index !== -1){
					spawn('open http://nba.com/'+model.team+'/node/'+model.nodes[index].nid,function(){
						rl.resume();
					});
				} else {
					search();
				}
				break;
			default:
				var position = navigate.position();

				if((position.y !== -1) && (position.x !== -1) && key.name === 'c'){
					var prop = model.getNodePropName(position.x);

					readline.moveCursor(process.stdin,-1,0);
					readline.clearLine(process.stdin,1);

					if(prop !== false){
						cp.copy(model.nodes[position.y][prop]);
					}
					
				} else {
					navigate.reset();
					model.searchString += key.name;
					search(model.searchString);	
				}
				
				break;
		}
	}
};

var search = function(title){
	title = title || '';

	rl.pause();

	model.request(title,function(rsp){
		model.nodes = model.formatNodes(rsp);
		readline.clearScreenDown(process.stdin);
		listNodes();
		readline.moveCursor(process.stdin,model.searchString.length,-(model.nodes.length+2));
		rl.resume();
	});
};

var navigate = (function(){
	var yPos = -1,
		xPos = -1;

	var reset = function(){
		yPos = -1;
		xPos = -1;
	};

	var nodePropertyLength = function(){
		if(model.nodes[0]){
			var length = 0;
			for(var i in model.nodes[0]){
				length++;
			}

			return length;
		} else {
			return -1;
		}
	};

	var position = function(){
		return {
			x: xPos,
			y: yPos
		};
	};

	var down = function(){
		if(yPos >= model.nodes.length-1){
			yPos = -1;
		} else {
			yPos++;
		}
	};

	var up = function(){
		if(yPos === -1){
			yPos = model.nodes.length-1;
		} else {
			yPos--;
		}
	};

	var left = function(){
		if(xPos === -1){
			xPos = nodePropertyLength()-1;
		} else {
			xPos--;
		}
	};

	var right = function(){
		if(xPos >= nodePropertyLength()-1){
			xPos = -1;
		} else {
			xPos++;
		}
	};

	return {
		down: down,
		up: up,
		left: left,
		right: right,
		position: position,
		reset: reset
	};
}());

var init = function(){
	if(!settings.length){
		rl.question('NBA Team Name: ',function(team){
			model.setTeam(team.toLowerCase());
		});
	} else {
		model.setTeam(settings[0]);
	}

	readline.emitKeypressEvents(process.stdin);
	process.stdin.setRawMode(true);
	process.stdin.on('keypress',keyHandler);
};

module.exports = {
	init
}