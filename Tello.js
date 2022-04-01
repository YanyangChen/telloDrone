

class Tello {

	constructor(){
		this.tello_address = '192.168.10.1';
		this.command_port = 8889;
		//console.log(1);
		
		const dgram = require('dgram');
		this.command_socket = dgram.createSocket('udp4');
		this.initCommandSocket();

	}

	// function for handling incoming messages & errors from tello
	initCommandSocket(){
		this.command_socket.on('message', (msg, rinfo) => {
			console.log(`got ${msg}`)
		});
		this.command_socket.on('error', (err) => {
				console.log(`error: ${err}\n closing socket`);
				this.command_socket.close();
		});
		this.command_socket.on('listening', () => {
			let address = this.command_socket.address();
			console.log(`established connection with ${address.address}:${address.port}`)
		});
		this.command_socket.bind(this.command_port);
	}

	// function for sending commands to tello
	sendCommand(message){
		var command = new Buffer.from(message);
		this.command_socket.send(command, 0, command.length, this.command_port, this.tello_address, (err, bytes) =>{
			if(err){
				console.log(err);
				//if error, keep sending the command till succeed, need test
				sendCommand(message)
			}
		})
	}

	// function to command the drone through command line
	startCLI(){
		// first enter SDK mode:
		this.sendCommand('command');
		// create CLInterface
		const readline = require('readline');
		const rl = readline.createInterface({
		  input: process.stdin,
		  output: process.stdout
		});

		let that = this;
		rl.on('line', (line) => {
			// if we type in close, close interface
			if(line === 'close'){
				rl.close();
			}

			if(line === 'tl'){
				//that.sendCommand('takeoff');
				(async() => {
				//setTimeout(function(){that.sendCommand('takeoff');}, 1000);
				that.sendCommand('takeoff');
				await sleep(8000);
				//console.log("landing");
				that.sendCommand('land');
				//setTimeout(function(){console.log("landing");that.sendCommand('land');}, 1000);
				})()
			}

			if(line === 'flyline'){
				//that.sendCommand('go 0 0 20 2');//for safety reason, go up 20 cm first
				(async() => {
				that.sendCommand('takeoff')
				await sleep(8000);
				that.sendCommand('go 40 0 0 20');
				await sleep(5000);
				that.sendCommand('go -40 0 0 20');
				await sleep(5000);
				that.sendCommand('land')
				})()
				//that.sendCommand('go 0 0 0 2');
			}

			if(line === 'triangle'){
				//that.sendCommand('go 0 0 20 2');//for safety reason, go up 20 cm first
				(async() => {
				that.sendCommand('takeoff');
				await sleep(10000);
				that.sendCommand('go 20 0 0 20');
				await sleep(5000);
				that.sendCommand('go 0 20 0 20');
				await sleep(5000);
				that.sendCommand('go -20 -20 0 20');
				await sleep(5000);
				that.sendCommand('land');
				})()
			}

			if(line === 'square'){
				that.sendCommand('go 0 0 20 2');//for safety reason, go up 20 cm first
				that.sendCommand('go 20 0 0 2');
				that.sendCommand('go 20 20 0 2');
				that.sendCommand('go 0 20 0 2');
				that.sendCommand('go 0 0 0 2');
			}

			if(line === 'circle'){
				that.sendCommand('go 0 0 20 2');//for safety reason, go up 20 cm first
				that.sendCommand('curve -20 48.3 0 0 96.6 0 2');
				that.sendCommand('curve 48.3 116.6 0 96.6 96.6 0 2');
				that.sendCommand('curve 116.6 48.3 0 96.6 0 0 2');
				that.sendCommand('curve 48.3 -20 0 0 0 0 2');
			}

			if(line === 'cube'){
				that.sendCommand('go 0 0 20 2');//for safety reason, go up 20 cm first
				that.sendCommand('go 20 0 0 2');
				that.sendCommand('go 20 20 0 2');
				that.sendCommand('go 0 20 0 2');
				that.sendCommand('go 0 0 0 2');
				that.sendCommand('go 0 0 20 2');
				that.sendCommand('go 20 0 0 2');
				that.sendCommand('go 20 20 0 2');
				that.sendCommand('go 0 20 0 2');
				that.sendCommand('go 0 0 0 2');
			}

			if(line === 'rt'){
				readline.emitKeypressEvents(process.stdin);
				process.stdin.setRawMode(true);
				process.stdin.on('keypress', (str, key) => {
					if (key.ctrl && key.name === 'c') {
					process.exit();
					} else {
					console.log(`You pressed the "${str}" key`);
					if(str === 't') {console.log('taking off');that.sendCommand('takeoff')};
					if(str === 'l') {console.log('landing');that.sendCommand('land')};
					if(str === 'w') {console.log('forward 20');that.sendCommand('forward 20');}
					if(str === 's') {console.log('back 20');that.sendCommand('back 20');}
					if(str === 'a') {console.log('left 20');that.sendCommand('left 20');}
					if(str === 'd') {console.log('right 20');that.sendCommand('right 20');}
					if(str === 'u') {console.log('up 20');that.sendCommand('up 20');}
					if(str === 'j') {console.log('down 20');that.sendCommand('down 20');}
					if(str === 'h') {console.log('ccw 20');that.sendCommand('ccw 20');}
					if(str === 'k') {console.log('cw 20');that.sendCommand('cw 20');}
					if(str === 'g') {console.log('flip forward ');that.sendCommand('flip f');}
					if(str === 'b') {console.log('flip backward ');that.sendCommand('flip b');}
					if(str === 'v') {console.log('flip left ');that.sendCommand('flip l');}
					if(str === 'n') {console.log('flip right ');that.sendCommand('flip r');}
					//if(str === 'c') {console.log('closing off');that.sendCommand('close');process.exit();}
					console.log();
					//console.log(key);
					console.log();
					}
				});
				
			}
			// send command receive from CL to tello
			that.sendCommand(line);
		}).on('close', () => {
			// upon closing interface, terminate program
			that.command_socket.close();
			process.exit(0);
		})
	}

	  keypress = function(){
		this.readline.emitKeypressEvents(process.stdin);
		console.log("in rt func")
		if (process.stdin.isTTY)
			process.stdin.setRawMode(true);
	
		process.stdin.on('keypress', (chunk, key) => {
			if (key && key.name == 'q')
			console.log("q pressed!")
			//keypress();
			});
	
		process.stdin.on('keypress', (chunk, key) => {
			if (key && key.name == 'Z')
			console.log("Z pressed!")
			rl.close();
			});

		process.stdin.setRawMode(true);
		process.stdin.resume();
	}
}

function sleep(ms) {
	return new Promise((resolve) => {
	  setTimeout(resolve, ms);
	});
  }

// init drone and start
let drone = new Tello();
drone.startCLI();

// IMPORTANT close socket connection upon exception
process.on('uncaughtException', () => {
	drone.command_socket.close();
});

// ENJOY!