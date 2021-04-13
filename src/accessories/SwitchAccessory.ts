import { Service, PlatformAccessory, Logger, PlatformConfig, CharacteristicValue, CharacteristicSetCallback } from 'homebridge';

import { NexaHomebridgePlatform } from '../platform';
import { NexaObject } from '../types/NexaObject';
import { HttpRequest } from '../utils/httprequest';

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
      .setCharacteristic(this.platform.Characteristic.SerialNumber, 'Nexa-'+accessory.context.device.id);

    this.service = this.accessory.getService(this.platform.Service.Switch) || this.accessory.addService(this.platform.Service.Switch);
    this.service.setCharacteristic(this.platform.Characteristic.Name, accessory.context.device.name);
    this.service.addOptionalCharacteristic(this.platform.customCharacteristic.characteristic.ElectricPower);
    this.service.addOptionalCharacteristic(this.platform.Characteristic.Active);

    if (jsonItem.lastEvents.switchBinary!==undefined) {
      const isOn = jsonItem.lastEvents.switchBinary.value;
      this.service.setCharacteristic(this.platform.Characteristic.On, isOn);
    }

    if (jsonItem.lastEvents.power!==undefined) {
      const power = jsonItem.lastEvents.power.value;
      this.service.setCharacteristic(this.platform.customCharacteristic.characteristic.ElectricPower, power);

      const powerConsumptionLimit = this.config['PowerConsumptionLimit'] as number;
      this.service.setCharacteristic(this.platform.Characteristic.Active, power>powerConsumptionLimit);
    }

    this.service.getCharacteristic(this.platform.Characteristic.On).on('set', this.setOn.bind(this));  
  }

  setOn(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    const body = {
      method: value ? 'turnOn' : 'turnOff',
      cap: 'switchBinary',
    };

    const httpRequest = new HttpRequest(this.config, this.log);
    httpRequest.Update(this.accessory.context.device.id, body);

    callback(null, value);
  }
}