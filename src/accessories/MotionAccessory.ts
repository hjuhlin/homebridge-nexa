import { Service, PlatformAccessory, Logger, PlatformConfig } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class MotionAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaMotion')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.MotionSensor) || 
    this.accessory.addService(this.platform.Service.MotionSensor);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);

    if (jsonItem.lastEvents.notificationMotion!==undefined) {
      const haveMotion = jsonItem.lastEvents.notificationMotion.value;
      this.service.updateCharacteristic(this.platform.Characteristic.MotionDetected, haveMotion);
    }
  }
}
