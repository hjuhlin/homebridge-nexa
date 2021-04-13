import { Service, PlatformAccessory, Logger, PlatformConfig } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class HumidityAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaHumiditySensor')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Nexa-'+accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.HumiditySensor) || 
    this.accessory.addService(this.platform.Service.HumiditySensor);

    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.humidity!==undefined) {
      const humidity = jsonItem.lastEvents.humidity.value;
      this.service.updateCharacteristic(this.platform.Characteristic.CurrentRelativeHumidity, humidity);
    }
  }
}
