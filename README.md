# Homebridge plugin for RGB APA102 LED strip

[![npm](https://badgen.net/npm/v/homebridge-apa102-rgb) ![npm](https://badgen.net/npm/dt/homebridge-apa102-rgb)](https://www.npmjs.com/package/homebridge-apa102-rgb) 

[Homebridge](https://github.com/nfarina/homebridge) pluging for RGB APA102 Led strip on Raspberry Pi.

## Installation

Before installing this plugin, you should install Homebridge using the [official instructions](https://github.com/homebridge/homebridge/wiki).

### Install via Homebridge Config UI X

1. Search for `APA102 RGB` on the Plugins tab of [Config UI X](https://www.npmjs.com/package/homebridge-config-ui-x).
2. Install the `Homebridge APA102 RGB` plugin.

### Manual Installation

1. Install this plugin using: `npm install -g --unsafe-perm homebridge-apa102-rgb`.
2. Edit `config.json` manually to add your apa102.

**Note:** depending on your platform you might need to run `npm install -g` with root privileges.

See the [Homebridge documentation](https://github.com/nfarina/homebridge#readme) for more information.

## Wiring

![Scheme](https://github.com/romaintalleu/homebridge-apa102-rgb/blob/master/images/rpi_apa102.png)

## Configuration 

Update your Homebridge `config.json` file. See [config-sample.json](config-sample.json) for a complete example.

```javascript
{
	"bridge": {
		"name": "Homebridge",
		"username": "CC:22:3D:E3:CE:30",
		"port": 51826,
		"pin": "031-45-154"
	},
	"description": "An example configuration of RGB APA102 LED strip with Raspberry PI",
	"accessories": [
		{
			"accessory": "APA102-RGB",
			"name": "APA102 Led strip",
			"ledCount": 8,
			"dataPin": 23,
			"clockPin": 24,
			"manufacturer": "APA102-RBG",
			"model": "APA102-RGB",
			"serial": "15822776-AB07-4DF8-9E0A-D17EE5ED0DA1"
		}
	],
	"platforms": []
}
```

Name | Value | Required | Notes
----------- | ------- | -------------- | --------------
accessory | APA102-RGB | yes | Must be set to "APA102-RGB"
name | _(custom)_ | yes | Name of accessory that will appear in [HomeKit](https://www.apple.com/ios/home/) app
ledCount | _(custom)_ | yes | Number of leds on your strip
dataPin | _(custom)_ | yes | GPIO number of your data
clockPin | _(custom)_ | yes | GPIO number of your clock
manufacturer | _(custom)_ | optional | The text of manufacturer
model | _(custom)_ | optional | The text of model
serial | _(custom)_ | optional | The text of serial
