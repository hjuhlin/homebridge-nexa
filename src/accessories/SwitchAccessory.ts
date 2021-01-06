import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';
import { HttpRequest } from '../utils/httprequest.js';

export class SwitchAccessory {
  private service: Service;

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
    this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, false);
 
    if (jsonItem.lastEvents.switchBinary!==undefined) {
      const isOn = jsonItem.lastEvents.switchBinary.value;
      this.service.setCharacteristic(this.platform.Characteristic.On, isOn);
    }

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this));  
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, true);

    const body = {
      method: value ? 'turnOn' : 'turnOff',
      cap: 'switchBinary',
    };

    const httpRequest = new HttpRequest(this.config, this.log);
    httpRequest.Update(this.accessory.context.device.id, body).then(()=> {
      this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, false);
    });

    callback(null, value);
  }
}