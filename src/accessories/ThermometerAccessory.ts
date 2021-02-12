import { Service, PlatformAccessory, Logger, PlatformConfig } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class ThermometerAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaThermometerSensor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.TemperatureSensor) || 
    this.accessory.addService(this.platform.Service.TemperatureSensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.temperature!==undefined) {
      const temperature = jsonItem.lastEvents.temperature.value;
      
      this.service.getCharacteristic(this.platform.Characteristic.CurrentTemperature).setProps({minValue: -100, maxValue: 100});
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentTemperature, temperature);
    }
  }
}
