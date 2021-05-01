var rpio = require('rpio');
var pjson = require('./package.json');

var Service, Characteristic;

module.exports = (homebridge) => {
	Service = homebridge.hap.Service;
	Characteristic = homebridge.hap.Characteristic;
	homebridge.registerAccessory('APA102-RGB', LedStripAccessory);
}

class LedStripAccessory {

	constructor(log, config, homebridge) {
		this.log = log;
		this.name = config.name;
		this.dataPin = config.dataPin || 23;
		this.clockPin = config.clockPin || 24;
		this.ledCount = config.ledCount || 0;
		this.log("APA102-RGB '" + this.name + "' init...");

		this.informationService = new Service.AccessoryInformation()
			.setCharacteristic(Characteristic.Manufacturer, config.manufacturer || 'APA102-RBG')
			.setCharacteristic(Characteristic.Model, config.model || 'APA102-RGB')
			.setCharacteristic(Characteristic.SerialNumber, config.serial || '15822776-AB07-4DF8-9E0A-D17EE5ED0DA1')
			.setCharacteristic(Characteristic.FirmwareRevision, 'v' + pjson.version);

		this.color = {
			hue: 0,
			saturation: 0,
			brightness: 0
		}

		rpio.init({ gpiomem: true, mapping: 'gpio' });
		rpio.open(this.clockPin, rpio.OUTPUT, 0);
		rpio.open(this.dataPin, rpio.OUTPUT, 0);
	}

	writeByte(data) {
		for (var i = 0; i < 8; i++) {
			if (data & 0x80) {
				rpio.write(23, rpio.HIGH);
			} else {
				rpio.write(23, rpio.LOW);
			}

			rpio.write(24, rpio.LOW);
			rpio.write(24, rpio.HIGH);

			data <<= 1;
		}
	}

	writeZeroBytes(count) {
		for (var i = 0; i < count; i++) {
			this.writeByte(0);
		}
	}

	setStripColor(colors) {
		const [red, green, blue] = colors;

		this.log("Set color '%s %s %s", Math.round(red), Math.round(green), Math.round(blue));
		this.writeZeroBytes(4); // Header

		for(var i = 0; i < this.ledCount; i++) {
			this.writeByte(0xFF);
			this.writeByte(Math.round(blue));  // Blue
			this.writeByte(Math.round(green)); // Green
			this.writeByte(Math.round(red));   // Red
		}

		this.writeZeroBytes(4); // Footer
	}

	setStripCurrentColor() {
		this.setStripColor(this.hsvToRgb(this.color.hue, this.color.saturation, this.color.brightness));
	}

	hsvToRgb(hue, saturation, value) {
		let r, g, b;
		const h = hue / 360
		const s = saturation / 100
		const v = value / 100
		const i = Math.floor(h * 6);
		const f = h * 6 - i;
		const p = v * (1 - s);
		const q = v * (1 - f * s);
		const t = v * (1 - (1 - f) * s);

		switch (i % 6) {
			case 0: r = v, g = t, b = p; break;
			case 1: r = q, g = v, b = p; break;
			case 2: r = p, g = v, b = t; break;
			case 3: r = p, g = q, b = v; break;
			case 4: r = t, g = p, b = v; break;
			case 5: r = v, g = p, b = q; break;
		}

		return [r * 255, g * 255, b * 255];
	}

	setPowerOn(value) {
		if (value && this.color.brightness == 0) {
			this.color.brightness = 100;
			this.log("Set power state on the '%s' to %s", this.name, value);
			this.setStripCurrentColor();
		} else if (!value) {
			this.color.brightness = 0;
			this.log("Set power state on the '%s' to %s", this.name, value);
			this.setStripCurrentColor();
		}
	}

	setHue(value) {
		this.color.hue = value;
		this.log("Set hue on the '%s' to %s", this.name, this.color.hue);
		this.setStripCurrentColor();
	}

	setSaturation(value) {
		this.color.saturation = value;
		this.log("Set saturation on the '%s' to %s", this.name, this.color.saturation);
		this.setStripCurrentColor();
	}

	setBrightness(value) { 
		this.color.brightness = value;
		this.log("Set brightness on the '%s' to %s", this.name, this.color.brightness);
		this.setStripCurrentColor();
	}

	identify(value) {
		this.log("Identify");

		this.setStripColor([0, 0, 0]);

		setTimeout(function () {
			this.setStripColor([0, 0, 255]);
		}.bind(this), 500);

		setTimeout(function () {
			this.setStripColor([0, 0, 0]);
		}.bind(this), 1000);

		setTimeout(function () {
			this.setStripColor([0, 0, 255]);
		}.bind(this), 1500);

		setTimeout(function () {
			this.setStripColor([0, 0, 0]);
		}.bind(this), 2000);

		setTimeout(function () {
			this.setStripColor([0, 0, 255]);
		}.bind(this), 2500);
	}

	getServices() {
		this.service = new Service.Lightbulb(this.name);

		this.service
			.getCharacteristic(Characteristic.On)
			.onGet(this.color.brightness > 0)
			.onSet(this.setPowerOn.bind(this));

		this.service
			.addCharacteristic(Characteristic.Hue)
			.onGet(this.color.hue)
			.onSet(this.setHue.bind(this));

		this.service
			.addCharacteristic(Characteristic.Saturation)
			.onGet(this.color.saturation)
			.onSet(this.setSaturation.bind(this));

		this.service
			.addCharacteristic(Characteristic.Brightness)
			.onGet(this.color.brightness)
			.onSet(this.setBrightness.bind(this));

		this.service
			.addCharacteristic(Characteristic.Identify)
			.onSet(this.identify.bind(this))

		return [this.informationService, this.service];
	}
}

