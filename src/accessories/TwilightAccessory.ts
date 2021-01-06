import { Service, PlatformAccessory, Logger, PlatformConfig, 
  CharacteristicValue, CharacteristicSetCallback, CharacteristicGetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class TwilightAccessory {
  private service: Service;

  public State = {
    IsNight: false,
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

    this.service = this.accessory.getService(this.platform.Service.LightSensor) || 
    this.accessory.addService(this.platform.Service.LightSensor);
    
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.notificationTwilight!==undefined) {
      this.State.IsNight = jsonItem.lastEvents.notificationTwilight.value;
    }

    this.service.getCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel)
      .on('set', this.setOn.bind(this))
      .on('get', this.getOn.bind(this));
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.State.IsNight = value === 1 ? true: false;
    
    callback(null);
  }

  getOn(callback: CharacteristicGetCallback) {

    callback(null, this.State.IsNight ? 1: 100);
  }
}
