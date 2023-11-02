/**
 * Created by noamc on 8/31/14.
 */
const WebSocket = require('ws'),
    http = require('http'),
    wav = require('wav'),
    fs = require('fs'),
    connect = require('connect'),
    serveStatic = require('serve-static');

if (!fs.existsSync("recordings"))
    fs.mkdirSync("recordings");

const app = connect();

app.use(serveStatic('public'));

let server = http.createServer(app);
server.listen(9191);

// var server = binaryServer({ server: server });
server = new WebSocket.Server({ server })

server.on('connection', function(client) {
    console.log("new connection...");
    // var writeStream = null;

    const fileName = "recordings/" + new Date().getTime();
    fileWriter = new wav.FileWriter(fileName + ".wav", {
        channels: 1,
        sampleRate: 48000,
        bitDepth: 16
    });

    client.on('message', function(message) {
        console.log('message')
        if (message instanceof Buffer) {
            fileWriter.write(message)
        } else {
            console.log({ message })
        }

    });

    client.on('close', function() {
        if (fileWriter != null) {
            fileWriter.end();
        }
        console.log("Connection Closed");
    });
});
