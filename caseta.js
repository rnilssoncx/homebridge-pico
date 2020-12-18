'use strict';

const net = require('net');

const lutronLogin = {
    username: "lutron",
    password: "integration",
}

class CasetaPro {
    constructor(log, host, port, eventHandler, buslog) {
        this._log = log;
        this.host = host;
        this.port = port;

        this.log(`Caseta Pro Initializing`);
        this.loggedIn = false;
        this.socket = new net.Socket();
        this.buslog = buslog;
        this.eventHandler = eventHandler;


        this.socket.on('connect', () => {
            this.log(`Caseta Pro Connected`);
        });
        this.socket.on('data', this.receiveData.bind(this));
        this.socket.on('end', () => {
        });
        this.socket.on('error', (error) => {
            this.log(error);
        });
        this.socket.destroy();

        this.manageSocket();
        this.timer = setInterval(this.manageSocket.bind(this), 60000);
    }

    receiveData(data) {
        // TODO: do we need to worry about partial strings?
        const lines = data.toString().split("\r\n").filter(l => l != "");

        for (let line of lines) {
            if (this.buslog != 'off' && (!/^GNET>\s*/.test(line) || this.buslog == 'full')) {
                this.log(`Bus Data: ${line}`);
            }
            if (this.loggedIn) {
                const args = line.split(",");
                if (args[0] === "~DEVICE") {
                    this.eventHandler({
                        "host": this.host,
                        "device": args[1],
                        "button": args[2],
                        "action": args[3]
                    });
                }
            } else {
                if (/^login:\s*/.test(line)) {
                    this.socket.write(`${lutronLogin.username}\r\n`);
                } else if (/^password:\s*/.test(line)) {
                    this.socket.write(`${lutronLogin.password}\r\n`);
                } else if (/^GNET>\s*/.test(line)) {
                    this.loggedIn = true;
                    this.log('Logged in');
                } else {

                }
            }
        }
    }

    manageSocket() {
        if (this.socket.destroyed) {
            this.loggedIn = false;
            this.log('Attempting connection');
            this.socket.connect(this.port, this.host);
        } else if (!this.socket.connecting) {
            if (this.buslog == 'full') {
                this.log(`Writing Keep Alive`)
            }
            this.socket.write('\r\n');
        } else {
            this.log('Waiting for connection');
        }
    }

    log(message) {
        this._log(`[${this.host}] ${message}`);
    }
}

module.exports = CasetaPro;
