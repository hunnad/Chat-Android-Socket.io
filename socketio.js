var port = parseInt(process.argv[2]);

var io = require('socket.io').listen(3001);
var stdin = process.openStdin();

stdin.setEncoding('utf8');

stdin.on('data', function(chunk) {
	process.stderr.write(chunk);
});

io.set('transports', [ process.argv[3] ]);

var main = io.sockets.on('connection', function(socket) {
	socket.on('echo', function(data) {
		if(data)
			socket.emit('echo', data);
		else
			socket.emit('echo');
	});
	socket.on('echoSend', function(data) {
		if (typeof data == 'object') {
			socket.send(JSON.parse(JSON.stringify(data)));
		} else {
			socket.send(data);
		}
	});
	socket.on('echoAck', function(data, ack) {
		ack(data);
	});
	socket.on('requestAcknowledge', function(data) {
			socket.emit('requestAcknowledge', data, function(data) {
				process.stdout.write("__:ACKNOWLEDGE:" + data + "\n");
			});
	})
	socket.on('message', function(m) {
		process.stdout.write("__:MESSAGE:" + m + "\n");
	});
});

var ns1 = io.of('/ns1').on('connection', function(socket) {
	main.send("ns1");
	ns2.send("ns1");
});

var ns2 = io.of('/ns2').on('connection', function(socket) {
	main.send("ns2");
	ns1.send("ns2");
});

process.stdout.write("__:OK\n");
