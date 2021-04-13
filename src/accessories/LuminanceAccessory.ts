import { Service, PlatformAccessory, Logger, PlatformConfig} from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';

export class LuminanceAccessory {
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
      .setCharacteristic(this.platform.Characteristic.Model, 'NexaLuminance')
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Nexa-'+accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.LightSensor) || 
    this.accessory.addService(this.platform.Service.LightSensor);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    
    if (jsonItem.lastEvents.luminance!==undefined) {
      let luminance = jsonItem.lastEvents.luminance.value;

      if (luminance===0) {
        luminance=0.1;
      }

      this.service.updateCharacteristic(this.platform.Characteristic.CurrentAmbientLightLevel, luminance);
    }
  }
}
