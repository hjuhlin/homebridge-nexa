import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class ContactAccessory {
  private service: Service;

  private State = {
    IsOpen: false,
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaTransmitter')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.ContactSensor) || 
    this.accessory.addService(this.platform.Service.ContactSensor);
    
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    this.State.IsOpen = jsonItem.lastEvents.notificationContact.value;

    this.service.getCharacteristic(this.platform.Characteristic.ContactSensorState)
      .on('set', this.setOn.bind(this))
      .on('get', this.getOn.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.State.IsOpen = value === 1 ? true: false;

    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {
    callback(null, this.State.IsOpen);
  }
}
