import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';
import { HttpRequest } from '../utils/httprequest.js';

export class SwitchLevelAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaSwitchLevel')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Nexa-'+accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Lightbulb) || this.accessory.addService(this.platform.Service.Lightbulb);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, false);

    if (jsonItem.lastEvents.switchLevel!==undefined) {
      this.service.setCharacteristic(this.platform.Characteristic.Brightness, jsonItem.lastEvents.switchLevel.value);
      this.service.setCharacteristic(this.platform.Characteristic.On, jsonItem.lastEvents.switchLevel.value===0?false:true);
    }

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this)) ;

    this.service.getCharacteristic(this.platform.Characteristic.Brightness)
      .on('set', this.setBrightness.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const body = {
      'method': 'setValue',
      'cap': 'switchLevel',
      'arguments': [this.getBrightness(value as boolean ? 0: 100)],
    };

    const httpRequest = new HttpRequest(this.config, this.log);

    httpRequest.Update(this.accessory.context.device.id, body).then(()=> {
      this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, false);
    });
   
    callback(null);
  }

  setBrightness(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const brightness = value as number;

    const body = {
      'method': 'setValue',
      'cap': 'switchLevel',
      'arguments': [this.getBrightness(brightness)],
    };

    const httpRequest = new HttpRequest(this.config, this.log);

    httpRequest.Update(this.accessory.context.device.id, body).then(()=> {
      this.service.setCharacteristic(this.platform.Characteristic.TimeUpdate, false);
    });

    callback(null);
  }

  getBrightness(brightness:number) {
    return Math.round(((brightness < 10 && brightness > 0 ? 10 : brightness) / 100) * 10) / 10;
  }
}