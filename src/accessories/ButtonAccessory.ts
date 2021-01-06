import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';
import { HttpRequest } from '../utils/httprequest.js';

export class ButtonAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaButton')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.notificationButton!==undefined) {
      this.State.IsOn = jsonItem.lastEvents.notificationButton.value;
    }

    this.service.getCharacteristic(this.platform.Characteristic.On)
      .on('set', this.setOn.bind(this))  
      .on('get', this.getOn.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.State.IsOn = value as boolean;

    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {
    const httpRequest = new HttpRequest(this.config, this.log);

    httpRequest.GetStatus(this.accessory.context.device.id).then((results)=> {
      const jsonItem = (<NexaObject>results);
      
      if (jsonItem.lastEvents.notificationButton!==undefined) {
        this.State.IsOn = jsonItem.lastEvents.notificationButton.value;
      }
    });

    callback(null, this.State.IsOn);
  }
}