import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SwitchAccessory } from './accessories/SwitchAccessory';

import { HttpRequest } from './utils/httprequest.js';
import { NexaObject } from './types/NexaObject';
import { TwilightAccessory } from './accessories/TwilightAccessory';
import { ContactAccessory } from './accessories/ContactAccessory';
// import { SwitchLevelAccessory } from './accessories/SwitchLevelAccessory';
import { MotionAccessory } from './accessories/MotionAccessory';
import { ButtonAccessory } from './accessories/ButtonAccessory';
import { ThermometerAccessory } from './accessories/ThermometerAccessory';
import { HumidityAccessory } from './accessories/HumidityAccessory';
import { LuminanceAccessory } from './accessories/LuminanceAccessory';
import { CustomCharacteristic } from './CustomCharacteristic';

export class NexaHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];
  public customCharacteristic: CustomCharacteristic;

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
    
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.customCharacteristic = new CustomCharacteristic(api);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices();
    });

    setInterval(() => {
      const httpRequest = new HttpRequest(this.config, log);

      httpRequest.GetStatusListForAll().then((results)=> {

        (<NexaObject[]>results).forEach(device => {
          if (device.name !== undefined) {
            if (device.lastEvents.switchBinary!==undefined) {
              const accessoryObject = this.getAccessory(device, 'switch');
              const service = accessoryObject.accessory.getService(this.Service.Switch);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.On, device.lastEvents.switchBinary.value);
               
                if (device.lastEvents.power!==undefined) {
                  const power = device.lastEvents.power.value;
                  service.updateCharacteristic(this.customCharacteristic.characteristic.ElectricPower, power);

                  const powerConsumptionLimit = this.config['PowerConsumptionLimit'] as number;
                  service.setCharacteristic(this.Characteristic.Active, power>powerConsumptionLimit);
                }
              }
            }

            if (device.lastEvents.notificationTwilight!==undefined) {
              const accessoryObject = this.getAccessory(device, 'twilight');
              const service = accessoryObject.accessory.getService(this.Service.LightSensor);

              if (service!==undefined) {
                const isNight = device.lastEvents.notificationTwilight.value;
                service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, isNight ? 1: 100);
              }
            }

            if (device.lastEvents.notificationContact!==undefined) {
              const accessoryObject = this.getAccessory(device, 'contact');
              const service = accessoryObject.accessory.getService(this.Service.ContactSensor);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.ContactSensorState, device.lastEvents.notificationContact.value);
              }
            }

            if (device.lastEvents.notificationButton!==undefined) {
              const accessoryObject = this.getAccessory(device, 'button');
              const service = accessoryObject.accessory.getService(this.Service.ContactSensor);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.ContactSensorState, device.lastEvents.notificationButton.value);
              }
            }
            
            if (device.lastEvents.notificationMotion!==undefined) {
              const accessoryObject = this.getAccessory(device, 'motion');
              const service = accessoryObject.accessory.getService(this.Service.MotionSensor);

              //this.log.info('device.lastEvents.notificationMotion.value', device.lastEvents.notificationMotion.value);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.MotionDetected, device.lastEvents.notificationMotion.value);
              }
            }
              
            if (device.lastEvents.humidity!==undefined) {
              const accessoryObject = this.getAccessory(device, 'humidity');
              const service = accessoryObject.accessory.getService(this.Service.HumiditySensor);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, device.lastEvents.humidity.value);
              }
            }

            if (device.lastEvents.temperature!==undefined) {
              const accessoryObject = this.getAccessory(device, 'temperature');
              const service = accessoryObject.accessory.getService(this.Service.TemperatureSensor);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.CurrentTemperature, device.lastEvents.temperature.value);
              }
            }

            if (device.lastEvents.luminance!==undefined) {
              const accessoryObject = this.getAccessory(device, 'luminance');
              const service = accessoryObject.accessory.getService(this.Service.LightSensor);

              if (service!==undefined) {
                service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, device.lastEvents.luminance.value);
              }
            }
          }
        });
      });
    }, (this.config['UpdateTime'] as number) * 1000);
      
  }

  configureAccessory(accessory: PlatformAccessory) {
    this.log.info('Loading accessory from cache:', accessory.displayName);

    this.accessories.push(accessory);
  }

  discoverDevices() {
    const httpRequest = new HttpRequest(this.config, this.log);

    httpRequest.GetStatusListForAll().then((results)=> {
      for (const device of (<NexaObject[]>results)) {
        if (device.name !== undefined) {
          if (device) {
            if (device.lastEvents.switchBinary!==undefined) {
              const accessoryObject = this.getAccessory(device, 'switch');
              new SwitchAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'switch', accessoryObject.exists);
            }

            if (device.lastEvents.notificationTwilight!==undefined) {
              const accessoryObject = this.getAccessory(device, 'twilight');
              new TwilightAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'twilight', accessoryObject.exists);
            }

            if (device.lastEvents.notificationContact!==undefined) {
              const accessoryObject = this.getAccessory(device, 'contact');
              new ContactAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'contact', accessoryObject.exists);
            }

            if (device.lastEvents.notificationButton!==undefined) {
              const accessoryObject = this.getAccessory(device, 'button');
              new ButtonAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'button', accessoryObject.exists);
            }

            if (device.lastEvents.notificationMotion!==undefined) {
              const accessoryObject = this.getAccessory(device, 'motion');
              new MotionAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'motion', accessoryObject.exists);
            }
              
            if (device.lastEvents.humidity!==undefined) {
              const accessoryObject = this.getAccessory(device, 'humidity');
              new HumidityAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'humidity', accessoryObject.exists);
            }

            if (device.lastEvents.temperature!==undefined) {
              const accessoryObject = this.getAccessory(device, 'temperature');
              new ThermometerAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'temperature', accessoryObject.exists);
            }

            if (device.lastEvents.luminance!==undefined) {
              const accessoryObject = this.getAccessory(device, 'luminance');
              new LuminanceAccessory(this, accessoryObject.accessory, device, this.config, this.log);
              this.addOrRestorAccessory(accessoryObject.accessory, device.name, 'luminance', accessoryObject.exists);
            }
          }
        }
      }

      this.accessories.forEach(accessory => {
        let found = false;

        for (const device of (<NexaObject[]>results)) {
          if (accessory.UUID === this.localIdForType(device, 'switch') ||
          accessory.UUID === this.localIdForType(device, 'twilight') ||
          accessory.UUID === this.localIdForType(device, 'contact')||
          accessory.UUID === this.localIdForType(device, 'button')||
          accessory.UUID === this.localIdForType(device, 'motion')||
          accessory.UUID === this.localIdForType(device, 'humidity')||
          accessory.UUID === this.localIdForType(device, 'temperature')||
          accessory.UUID === this.localIdForType(device, 'luminance')) {
            found = true;
          }
        }

        if (found === false || this.config['ClearAllAtStartUp'] as boolean) {
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          this.log.info('Removing existing accessory:', accessory.displayName);
        }
      });
    });
  }

  public getAccessory(device: NexaObject, type: string) {
    const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.localIdForType(device, type));

    if (existingAccessory!==undefined) {
      existingAccessory.displayName = device.name;

      return {accessory : existingAccessory, exists : true};
    }

    const accessory = new this.api.platformAccessory(device.name, this.localIdForType(device, type));
    accessory.context.device = device;

    return {accessory : accessory, exists : false};
  }

  public addOrRestorAccessory(accessory: PlatformAccessory<Record<string, unknown>>, name: string, type: string, exists: boolean ) {
    if (exists) {
      this.log.info('Restoring existing accessory:', name +' ('+type+')');
      this.api.updatePlatformAccessories([accessory]);
    } else {
      this.log.info('Adding new accessory:', name +' ('+type+')');
      this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
    }
  }

  localIdForType(device:NexaObject, type:string):string {
    return this.api.hap.uuid.generate(device.id.toString()+'_'+device.name+'_'+type);
  }
}

