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
    this.slowButtons = config.slowbuttons || [5,6];
    this.slowExtra = config.slowextra || 250;
    this.repeatTime = config.repeattime || 500;
    if (config.quiet) {
      this.log('"quiet" config setting is deprecated, switch to "buslog"');
    } 
    this.buslog = config.buslog || ((config.quiet || false) ? "full" : "off");
    if (['off', 'monitor', 'full'].indexOf(this.buslog) < 0) {
      this.log(`Invalid "buslog" setting "${this.buslog}", using "full"`);
      this.buslog = "full";
    }
    this.log(`Bus Logging set to ${this.buslog}`);
    this.longname = config.longname || false;
    this.servers = {};
    for (let server of config.servers) {
      this.servers[server.host] = {
        switches: server.switches,
        process: new CasetaPro(log, server.host, server.port, this.eventHandler.bind(this), this.buslog)
      };
    }
    this.clickProcessor = {};
  }

  accessories(callback) {
    let _accessories = [];

    for (let key of Object.keys(this.servers)) {
      for (let sw of this.servers[key].switches) {
        this.log(`${key}: "${sw.name}" - ${sw.type} - ${sw.pico}`);
        const accessory = new PicoRemote(this.log, sw, this.api, version, this.longname);
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
        let clickTime = this.clickTime
        if (this.slowButtons.includes(parseInt(event.button))) {
          clickTime += this.slowExtra
        }
        this.clickProcessor[eventKey] = new Click(event, clickTime, this.repeatTime, this.log, 
          this.servers[event.host][event.device].repeatButton(event.button), 
          this.servers[event.host][event.device].repeatMax(), this.clickHandler.bind(this));
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
  constructor(event, doubleClickTime, repeatTime, log, repeat, repeatMax, callback) {
    this.host = event.host
    this.device = event.device
    this.button = event.button
    this.doubleClickTime = doubleClickTime
    this.repeatTime = repeatTime
    this.repeatMax = repeatMax
    this.log = log
    this.repeat = repeat
    this.callback = callback
    this.repeatCount = 0
    this.log(`[${this.host}] Device ${this.device} Button ${this.button} Repeat ${this.repeat} Click ${doubleClickTime} - Created tracker`)
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

  _setTimer(milliseconds = this.doubleClickTime) {
    this.timer = setTimeout(this._finished.bind(this), milliseconds)
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
      if (this.repeat) {
        this.repeatCount++
        if (this.repeatCount < this.repeatMax)
          this._setTimer(this.repeatTime)
        else 
          this.repeatCount = 0;
      }
    } else {
      event.click = 0
    }
    if (this.repeatCount == 0 || (this.repeatCount > 0 && event.click == 2)) {
      this.callback(event)
    } else {
      this.repeatCount = 0
    }
  }
}