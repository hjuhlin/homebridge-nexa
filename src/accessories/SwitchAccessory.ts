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
    this.service.addOptionalCharacteristic(this.platform.customCharacteristic.characteristic.TotalPowerConsumption);
    this.service.addOptionalCharacteristic(this.platform.customCharacteristic.characteristic.ResetTotal);
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

      this.service.getCharacteristic(this.platform.customCharacteristic.characteristic.ResetTotal)
        .on('set', this.setResetTotal.bind(this));  
      
      this.service.getCharacteristic(this.platform.customCharacteristic.characteristic.ResetTotal)
        .on('get', this.getResetTotal.bind(this));  
  
      this.accessory.context.totalenergy = 0;
      this.accessory.context.lastUpdated = new Date().getTime();
      this.accessory.context.startTime = new Date();
      this.accessory.context.lastReset = 0;
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

    if (this.accessory.context.fakeGatoService!==undefined) {
      this.accessory.context.fakeGatoService.addEntry({
        time: Math.round(new Date().valueOf() / 1000), 
        status: value?1:0,
      });
    }

    callback(null);
  }

  setResetTotal(value: CharacteristicValue, callback: CharacteristicSetCallback) {
    this.accessory.context.totalenergy = 0;
    this.accessory.context.lastReset = value;
    this.accessory.context.fakeGatoService.setExtraPersistedData({ totalenergy: 0, lastReset: this.accessory.context.lastReset });

    callback(null);
  }

  getResetTotal(callback: CharacteristicSetCallback) {
    const extraPersistedData = this.accessory.context.fakeGatoService.getExtraPersistedData();

    if (extraPersistedData !== undefined) {
      this.accessory.context.lastReset = extraPersistedData.lastReset;
    }
    
    callback(null, this.accessory.context.lastReset);
  }
}