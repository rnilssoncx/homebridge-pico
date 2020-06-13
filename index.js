'use strict';

const platformPrettyName = 'Pico';
const platformName = require('./package.json').name;
const version = require('./package.json').version;

const PicoRemote = require('./accessory.js');
const CasetaPro = require('./caseta.js');

var Accessory, Service, Characteristic, UUIDGen, CustomCharacteristic;

module.exports = function (homebridge) {
  Accessory = homebridge.platformAccessory;
  Service = homebridge.hap.Service;
  Characteristic = homebridge.hap.Characteristic;

  UUIDGen = homebridge.hap.uuid;

  homebridge.registerPlatform(platformName, platformPrettyName, Pico);
}

class Pico {
  constructor(log, config, api) {
    this.log = log;
    this.log(`${platformPrettyName} Plugin Loaded - Version ${version}`);
    this.api = api;
    this.clickTime = config.clicktime || 500;
    this.quiet = config.quiet || false;
    if (this.quiet) {
      this.log('Quiet logging mode');
    }
    this.servers = {};
    for (let server of config.servers) {
      this.servers[server.host] = {
        switches: server.switches,
        process: new CasetaPro(log, server.host, server.port, this.eventHandler.bind(this), this.quiet)
      };
    }
    this.clickProcessor = {};
  }

  accessories(callback) {
    let _accessories = [];

    for (let key of Object.keys(this.servers)) {
      for (let sw of this.servers[key].switches) {
        this.log(`${key}: "${sw.name}" - ${sw.type} - ${sw.pico}`);
        const accessory = new PicoRemote(this.log, sw, this.api, version, this.quiet);
        if (!Array.isArray(sw.pico)) {
          sw.pico = [sw.pico];
        }
        for (let pico of sw.pico) {
          this.servers[key][pico] = accessory;
        }
        _accessories.push(accessory);
      }

    }
    callback(_accessories);
  }

  eventHandler(event) {
    if (this.servers[event.host][event.device]) {
      let eventKey = `${event.host} ${event.device} ${event.button}`
      if (!this.clickProcessor[eventKey]) {
        this.clickProcessor[eventKey] = new Click(event, this.clickTime, this.log, this.clickHandler.bind(this));
      } else {
        this.clickProcessor[eventKey].click(event);
      }
    }
  }

  clickHandler(event) {
     this.servers[event.host][event.device].trigger(event.button,event.click);
  }
}

class Click {
  constructor(event, doubleClickTime, log, callback) {
    this.host = event.host
    this.device = event.device
    this.button = event.button
    this.doubleClickTime = doubleClickTime
    this.log = log
    this.callback = callback
    this.log(`[${this.host}] Device ${this.device} Button ${this.button} - Created tracker`)

    this.click(event)
  }

  click(event) {
    switch (event.action) {
      case '3': // Down
        if (this.timer) {
          this._finished(true)
        } else {
          this._setTimer()
        }
        break;
      case '4': // Up
        if (this.timer) {
          this.ups++
        }
        break;
    }
  }

  _setTimer() {
    this.timer = setTimeout(this._finished.bind(this), this.doubleClickTime)
    this.ups = 0
  }

  _finished(doubleClick = false) {
    let event = {
      host: this.host,
      device: this.device,
      button: this.button
    }
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    if (doubleClick) {
      event.click = 1
    } else if (this.ups == 0) {
      event.click = 2
    } else {
      event.click = 0
    }
    this.callback(event)
  }
}