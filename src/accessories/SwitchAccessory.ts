import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';

import { HttpRequest } from '../utils/httprequest.js';
import { NexaObject } from '../types/NexaObject';

export class SwitchAccessory {
  private service: Service;

  private State = {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaSwitch')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.State.IsOn = jsonItem.lastEvents.switchBinary.value;

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))  
      .on('get', this.getOn.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    if (this.State.IsOn !== value as boolean) {
      this.State.IsOn = value as boolean;

      const body = {
        method: value ? 'turnOn' : 'turnOff',
        cap: 'switchBinary',
      };

      const httpRequest = new HttpRequest(this.config);

      httpRequest.Update(this.accessory.context.device.id, body);
    }

    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {
    callback(null, this.State.IsOn);
  }
}