import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';

import { HttpRequest } from '../utils/httprequest.js';
import { NexaObject } from '../types/NexaObject';

export class SwitchLevelAccessory {
  private service: Service;

  private State = {
    Brightness: 0,
    IsOn: false,
  };

  constructor(
    private readonly platform: NexaHomebridgePlatform,
    private readonly accessory: PlatformAccessory,
    private readonly jsonItem: NexaObject,
    public readonly config: PlatformConfig,
    public readonly log: Logger,
  ) {
    this.accessory.getService(this.platform.Service.AccessoryInformation)!
      .setCharacteristic(this.platform.Characteristic.Manufacturer, 'Nexa')
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaSwitchLevel')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.State.Brightness = jsonItem.lastEvents.switchLevel.value;

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this)) 
      .on('get', this.getOn.bind(this));

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .on('set', this.setBrightness.bind(this))
      .on('get', this.getBrightness.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (this.State.IsOn !== value as boolean) {
      this.State.IsOn = value as boolean;

      if (this.State.IsOn) {
        this.State.Brightness = 100;
      } else {
        this.State.Brightness = 0;
      }

      const number = Math.round(((this.State.Brightness < 10 && this.State.Brightness > 0 ? 10 : this.State.Brightness) / 100) * 10) / 10;

      const body = {
        'method': 'setValue',
        'cap': 'switchLevel',
        'arguments': [number],
      };

      const httpRequest = new HttpRequest(this.config);

      httpRequest.Update(this.accessory.context.device.id, body);
    }

    callback(null);
  }

  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (this.State.Brightness !== value as number) {
      this.State.Brightness = value as number;

      if (this.State.Brightness===0) {
        this.State.IsOn=false;
      } else {
        this.State.IsOn=true;
      }

      const number = Math.round(((this.State.Brightness < 10 && this.State.Brightness > 0 ? 10 : this.State.Brightness) / 100) * 10) / 10;

      const body = {
        'method': 'setValue',
        'cap': 'switchLevel',
        'arguments': [number],
      };

      const httpRequest = new HttpRequest(this.config);

      httpRequest.Update(this.accessory.context.device.id, body);
    }

    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {
    callback(null, this.State.IsOn);
  }

  getBrightness(callback: CharacteristicGetCallback) {
    callback(null, this.State.Brightness);
  }
}