'use strict';

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
  '13': 'Closed',
  '14': 'On 1',
  '15': 'Off 1',
  '16': 'On 2',
  '17': 'Off 2',
  '18': 'Toggle 1',
  '19': 'Toggle 2',
  '20': 'Toggle 3',
  '21': 'Toggle 4',
  '22': 'Open 1',
  '23': 'Closed 1',
  '24': 'Open 2',
  '25': 'Closed 2'
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
  "PJ2-4B-XXX-L21": ['14', '15', '16', '17'],
  "PJ2-4B-XXX-S21": ['22', '23', '24', '25'],
  "PJ2-4B-XXX-LS21": ['2', '4', '12', '13'],
  "PJ2-4B-XXX-L31": ['8', '9', '10', '11'],
//  "PJ2-4B-XXX-S31": ['12', '9', '10', '13'],
  "PJ2-4B-XXX-S31": ['8', '9', '10', '11'],
  "PJ2-4B-XXX-L41": ['18', '19', '20', '21'],
  "custom": []
}

let Accessory, Characteristic, Service;

class PicoRemote {
  constructor(log, sw, api, version, longname) {
    Accessory = api.hap.Accessory;
    Characteristic = api.hap.Characteristic;
    Service = api.hap.Service;

    this.log = log;
    this.log(`Creating ${sw.type} switch: ${sw.name}`);
    this.name = sw.name;
    this.type = sw.type;
    this.custom_buttons = sw.buttons || [];
    this.repeat = sw.repeat || [];
    if (!Array.isArray(this.repeat)) {
      this.repeat = [this.repeat]
    }
    this.repeatmax = sw.repeatmax || 10;
    this.version = version;
    this.longname = longname;
    this.buttons = {};
  }

  repeatButton(button) {
    return this.repeat.includes(parseInt(button))
  }

  repeatMax() {
    return this.repeatmax;
  }

  getServices() {
    let services = [];
    let index = 1;
    let button_list = [];
    let label;

    if (this.type in types) {
      if (this.type == "custom") {
        button_list = this.custom_buttons;
      } else {
        button_list = types[this.type];
      }
      services.push(this.getAccessoryInformationService());

      for (let button of button_list) {
        if (button in labels) {
          label = labels[button];
        } else {
          label = `Custom button ${button}`;
        }
        let switchService = new Service.StatelessProgrammableSwitch((this.longname ? this.name + " " : "") + 
          label, label);
        switchService.getCharacteristic(Characteristic.ProgrammableSwitchEvent)
          .setProps({ maxValue: 2 });
        switchService.getCharacteristic(Characteristic.ServiceLabelIndex).setValue(index++);
        this.buttons[button] = switchService;
        services.push(switchService);
        this.log(`Switch "${this.name}" Button "${label}" created`);
      }
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

    if (button in this.buttons) {
      this.buttons[button].getCharacteristic(Characteristic.ProgrammableSwitchEvent).setValue(click);
      this.log(`${this.name} - ${labels[button]} ${clickType[click]} press`);
    } else {
      this.log(`${this.name} - Invalid button: ${button}`);
    }
  }

}

module.exports = PicoRemote;
