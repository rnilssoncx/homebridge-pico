'use strict';

const http = require('http');

const labels = {
  '2': 'On',
  '5': 'Up',
  '3': 'Favorite',
  '6': 'Down',
  '4': 'Off',
  '8': 'Scene 1',
  '9': 'Scene 2',
  '10': 'Scene 3',
  '11': 'Scene Off',
}

const types = {
  "scene": ['8', '9', '10', '11'],
  "simple": ['2', '4'],
  "dimmer": ['2', '5', '6', '4'],
  "favorite": ['2', '5', '3', '6', '4'],
  "PJ2-3B": ['2', '3', '4']
}

let Accessory, Characteristic, Service;

class PicoRemote {
  constructor(log, sw, api, version, quiet) {
    Accessory = api.hap.Accessory;
    Characteristic = api.hap.Characteristic;
    Service = api.hap.Service;

    this.log = log;
    this.log(`Creating ${sw.type} switch: ${sw.name}`);
    this.name = sw.name;
    this.type = sw.type;
    this.version = version;
    this.quiet = quiet;
    this.buttons = {};
  }

  getServices() {
    let services = [];
    let index = 1;

    services.push(this.getAccessoryInformationService());

    for (let button of types[this.type]) {
      let switchService = new Service.StatelessProgrammableSwitch(labels[button], labels[button]);
      switchService.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
        .setProps({ maxValue: 2 });
      switchService.getCharacteristic(Characteristic.ServiceLabelIndex).setValue(index++);
      this.buttons[button] = switchService;
      services.push(switchService);
      this.log(`Switch "${this.name}" Button "${labels[button]}" created`);
    }

    return services;
  }

  getAccessoryInformationService() {
    return new Service.AccessoryInformation()
      .setCharacteristic(Characteristic.Name, this.name)
      .setCharacteristic(Characteristic.Manufacturer, 'Lutron')
      .setCharacteristic(Characteristic.Model, `Pico Remote - ${this.type}`)
      .setCharacteristic(Characteristic.FirmwareRevision, this.version)
      .setCharacteristic(Characteristic.HardwareRevision, this.version);
  }


  identify(callback) {
    this.log(`Identify requested on ${this.name}`);
    callback();
  }

  trigger(button, click) {
    const clickType = ['single', 'double', 'long'];

    this.buttons[button].getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(click);
    this.log(`${this.name} - ${labels[button]} ${clickType[click]} press`);
  }

}

module.exports = PicoRemote;
