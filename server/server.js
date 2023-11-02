/**
 * Created by noamc on 8/31/14.
 */
var binaryServer = require('binaryjs').BinaryServer,
    http = require('http'),
    wav = require('wav'),
    fs = require('fs'),
    connect = require('connect'),
    serveStatic = require('serve-static'),
    UAParser = require('./ua-parser'),
    CONFIG = require("../config.json");

var uaParser = new UAParser();

if (!fs.existsSync("recordings"))
    fs.mkdirSync("recordings");

var app = connect();

app.use(serveStatic('public'));

var server = http.createServer(app);
server.listen(9191);

var server = binaryServer({ server: server });

server.on('connection', function(client) {
    console.log("new connection...");
    var fileWriter = null;
    var writeStream = null;

    var userAgent = client._socket.upgradeReq.headers['user-agent'];
    uaParser.setUA(userAgent);
    var ua = uaParser.getResult();

    client.on('stream', function(stream, meta) {

        console.log("Stream Start@" + meta.sampleRate + "Hz");
        var fileName = "recordings/" + ua.os.name + "-" + ua.os.version + "_" + new Date().getTime();

        switch (CONFIG.AudioEncoding) {
            case "WAV":
                fileWriter = new wav.FileWriter(fileName + ".wav", {
                    channels: 1,
                    sampleRate: meta.sampleRate,
                    bitDepth: 16
                });
                stream.pipe(fileWriter);
                break;
        };

    });


    client.on('close', function() {
        if (fileWriter != null) {
            fileWriter.end();
        } else if (writeStream != null) {
            writeStream.end();
        }
        console.log("Connection Closed");
    });
});
