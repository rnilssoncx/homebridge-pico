# Pico Platform
[![verified-by-homebridge](https://badgen.net/badge/homebridge/verified/purple)](https://github.com/homebridge/homebridge/wiki/Verified-Plugins)
[![npm](https://badgen.net/npm/dt/homebridge-pico?color=purple)](https://www.npmjs.com/package/homebridge-pico)
[![donate](https://img.shields.io/badge/donate-paypal-green)](https://paypal.me/nilssonstudios)

A platform that exposes Lutron Pico Remotes to Homekit as buttons.  Supports single, double, and long press actions.

## Requirements

[Lutron Caseta Pro bridge](https://www.casetawireless.com/proproducts)

This plugin will not work with the standard Caseta bridge.

## Why do we need this platform

Lutron Pico Remote are a seemless way to add virtual control to any homekit device or scene.

## Installation instructions

After [Homebridge](https://github.com/nfarina/homebridge) has been installed:

 `sudo npm install -g homebridge-pico`

In the Lutron mobile app go to configure, choose Advanced, and then Integration.  Enable Telnet Support.  You can also choose to "Send Integration Report" here and it will email you the device list with IDs for your bridge.

Configure the plugin with `buslog` set to `monitor` or `full`.  Add your Pico remotes to your Lutron Pro bridge.  You do not have to associate the Pico remotes with Lutron lights.  Simply push any button on the Pico remote you'd like to add to this plugin and you'll see a log entry like this in homebridge:

`[6/13/2020, 11:14:23] [Pico] [<bridge IP>] Bus Data: ~DEVICE,63,2,3`

The number after `DEVICE` is the ID of the Pico remote you just pressed.


## Example config.json:

```json
{
  "bridge": {
      ...
  },
  "platforms": [
    {
      "platform": "Pico",
      "buslog": "monitor",
      "servers": [
        {
          "host": "<IP Address or Host Name>",
          "port": 23,
          "switches": [
            {
              "name": "Kitchen Pico",
              "pico": 22,
              "type": "simple"
            },
            {
             "name": "Home Theater Pico",
             "pico": [11,31],
             "type": "scene"
            }
          ]
        }
      ]
    }
  ]
}
```

`servers`: You can have one or more Lutro Caseta Pro bridges

`host`: IP Address or hostname of the Lutron Caseta Pro bridge

`port`: Port to use for the Lutron Caseta Pro bridge (default: 23)

`switches`: List of the Pico remotes to be exposed to Homekit

* `name`: Name of the remote as it will appear in HomeKit
* `pico`: One or more Pico Remotes that will trigger the Homekit button
* `type`:
  * `PJ2-2B`: Two buton Pico (previously `simple` - on/off
  * `PJ2-2BRL`: Four button Pico (previously `dimmer`) - on/brighten/dim/off
  * `PJ2-3B`: Three button Pico - on/favorite/off
  * `PJ2-3BRL`: Five button Pico (previously `favorite`) - on/brigthen/favorite/dim/off
  * `PJ2-4B-XXX-L01`: Four button Pico for lights - on/up/down/off,
  * `PJ2-4B-XXX-S01`: Four button Pico for shades - on/up/down/off,
  * `PJ2-4B-XXX-L21`: Four button Pico for 2 lights - on1/off1/on2/off2 
  * `PJ2-4B-XXX-S21`: Four button Pico for 2 shades - open1/closed1/open2/closed2
  * `PJ2-4B-XXX-LS21`: Four button Pico for lights and shades - on/off/open/closed,
  * `PJ2-4B-XXX-L31`: Four button Pico for lights (Previously `scene`) - scene1/scene2/scene3/off,
  * `PJ2-4B-XXX-S31`: Four button Pico for lights - open/scene1/scene2/close,
  * `PJ2-4B-XXX-L41`: Four button Pico with 4 toggles - toggle1/toggle2/toggle3/toggle4,
  * If you aren't sure what type to choose, the 2nd number after "DEVICE" in the log is the button pressed.  You can press the buttons on the Pico remote and compare the output to the list in `accessory.js`.  If you find you have buttons configured differently, or not in the list, please let me know and I'll add your Pico.


### Optional platform settings:

* `buslog`: (default: `off`)

  * `off`: No bus logging
  * `monitor`: Show Lutron commands sent and received on bus
  * `full`: Show all bus and keep alive activity

* `clicktime`:  The timeout for detecting a doubleclick in milliseconds.  (default: 500)

* `longname`:  If you'd like the name of the switch added to the function (`Dining Room Single Press` instead of `Single Press`) set this to `true`. For normal installations this should not be needed. (default: `false`)

## Credits

See [CONTRIBUTORS](CONTRIBUTORS.md) for acknowledgements to the individuals that contributed to this plugin.

## Some asks for friendly gestures

If you use this and like it - please leave a note by staring this package here or on GitHub.

If you use it and have a problem, file an issue at [GitHub](https://github.com/rnilsson/homebridge-pico/issues) - I'll try to help.

If you tried this, but don't like it: tell me about it in an issue too. I'll try my best
to address these in my spare time.

If you fork this, go ahead - I'll accept pull requests for enhancements.

## License

MIT License

Copyright (c) 2018 Robert Nilsson

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
