import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';
import { HttpRequest } from '../utils/httprequest.js';

export class MotionAccessory {
  private service: Service;

  public State = {
    HaveMotion: false,
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaMotion')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.MotionSensor) || 
    this.accessory.addService(this.platform.Service.MotionSensor);
    
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.notificationMotion!==undefined) {
      this.State.HaveMotion = jsonItem.lastEvents.notificationMotion.value;
    }

    this.service.getCharacteristic(this.platform.Characteristic.MotionDetected)
      .on('set', this.setOn.bind(this))
      .on('get', this.getOn.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.State.HaveMotion = value as boolean;
    
    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {
    const httpRequest = new HttpRequest(this.config, this.log);

    httpRequest.GetStatus(this.accessory.context.device.id).then((results)=> {
      const jsonItem = (<NexaObject>results);
      
      if (jsonItem.lastEvents.notificationMotion!==undefined) {
        this.State.HaveMotion = jsonItem.lastEvents.notificationMotion.value;
      }
    });

    callback(null, this.State.HaveMotion);
  }
}
