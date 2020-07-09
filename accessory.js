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
  '12': 'Open',
  '13': '33% Closed',
  '14': '66% Closed',
  '15': 'Closed',
  '16': '66% On',
  '17': '33% On',
  '18': 'On 1',
  '19': 'Off 1',
  '20': 'On 2',
  '21': 'Off 2',
  '22': 'Toggle 1',
  '23': 'Toggle 2',
  '24': 'Toggle 3',
  '25': 'Toggle 4'
  '26': 'Open 1',
  '27': 'Closed 1',
  '28': 'Open 2',
  '29': 'Closed 2',
}

const types = {
  "scene": ['8', '9', '10', '11'],
  "simple": ['2', '4'],
  "dimmer": ['2', '5', '6', '4'],
  "favorite": ['2', '5', '3', '6', '4'],
  "PJ2-2B": ['2', '4'],
  "PJ2-2BRL": ['2', '5', '6', '4'],
  "PJ2-3B": ['2', '3', '4'],
  "PJ2-3BRL": ['2', '5', '3', '6', '4'],
  "PJ2-4B-XXX-L01": ['2', '5', '6', '4'],
  "PJ2-4B-XXX-S01": ['12', '5', '6', '5'],
  "PJ2-4B-XXX-L21": ['18', '19', '20', '21'],
  "PJ2-4B-XXX-S21": ['26', '27', '28', '29'],
  "PJ2-4B-XXX-LS21": ['2', '4', '12', '15'],
  "PJ2-4B-XXX-L31": ['2', '16', '17', '4'],
  "PJ2-4B-XXX-S31": ['12', '13', '14', '15'],
  "PJ2-4B-XXX-L41": ['22', '23', '24', '25'],
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
