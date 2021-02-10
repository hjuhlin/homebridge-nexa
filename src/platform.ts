import { API, DynamicPlatformPlugin, Logger, PlatformAccessory, PlatformConfig, Service, Characteristic } from 'homebridge';

import { PLATFORM_NAME, PLUGIN_NAME } from './settings';
import { SwitchAccessory } from './accessories/SwitchAccessory';

import { HttpRequest } from './utils/httprequest.js';
import { NexaObject } from './types/NexaObject';
import { TwilightAccessory } from './accessories/TwilightAccessory';
import { ContactAccessory } from './accessories/ContactAccessory';
import { SwitchLevelAccessory } from './accessories/SwitchLevelAccessory';
import { MotionAccessory } from './accessories/MotionAccessory';
import { ButtonAccessory } from './accessories/ButtonAccessory';
import { ThermometerAndHumidityAccessory } from './accessories/ThermometerAndHumidityAccessory';

export class NexaHomebridgePlatform implements DynamicPlatformPlugin {
  public readonly Service: typeof Service = this.api.hap.Service;
  public readonly Characteristic: typeof Characteristic = this.api.hap.Characteristic;
  public readonly accessories: PlatformAccessory[] = [];

  constructor(
    public readonly log: Logger,
    public readonly config: PlatformConfig,
    public readonly api: API,
  ) {
    this.log.debug('Finished initializing platform:', this.config.name);

    this.api.on('didFinishLaunching', () => {
      log.debug('Executed didFinishLaunching callback');

      this.discoverDevices();
    });

    setInterval(() => {
      const httpRequest = new HttpRequest(this.config, log);

      httpRequest.GetStatusListForAll().then((results)=> {

        (<NexaObject[]>results).forEach(device => {
  
          if (device.name !== undefined) {
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.localId(device));

            if (existingAccessory!== undefined) {
            
              if (device.capabilities[0] === 'switchBinary') {  
                const service = existingAccessory.getService(this.Service.Switch);

                if (service!==undefined && device.lastEvents.switchBinary!==undefined) {
                  const isOn = device.lastEvents.switchBinary.value;

                  if (service.getCharacteristic(this.Characteristic.TimeUpdate).value===false) {
                    service.updateCharacteristic(this.Characteristic.On, isOn);
                  }
                }
              }

              if (device.capabilities[0] === 'notificationTwilight') {  
                const service = existingAccessory.getService(this.Service.LightSensor);

                if (service!==undefined && device.lastEvents.notificationTwilight !== undefined) {
                  const isNight = device.lastEvents.notificationTwilight.value;
                  service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, isNight ? 1: 100);
                }
              }

              if (device.capabilities[0] === 'notificationContact') { 
                const service = existingAccessory.getService(this.Service.ContactSensor);

                if (service!==undefined && device.lastEvents.notificationContact!==undefined) {
                  const isOpen = device.lastEvents.notificationContact.value;
                  service.updateCharacteristic(this.Characteristic.ContactSensorState, isOpen);
                }
              }

              if (device.capabilities[0] === 'switchLevel') { 
                const service = existingAccessory.getService(this.Service.Lightbulb);

                if (service!==undefined && device.lastEvents.switchLevel!==undefined) {
                  if (service.getCharacteristic(this.Characteristic.TimeUpdate).value===false) { 

                    const brightness = device.lastEvents.switchLevel.value*100;
                    service.updateCharacteristic(this.Characteristic.Brightness, brightness);
                    service.updateCharacteristic(this.Characteristic.On, brightness>0);
                  }
                }
              }

              if (device.capabilities[0] === 'notificationMotion') { 
                const service = existingAccessory.getService(this.Service.MotionSensor);

                if (service!==undefined && device.lastEvents.notificationMotion!==undefined) {
                  const haveMotion = device.lastEvents.notificationMotion.value;
                  service.updateCharacteristic(this.Characteristic.MotionDetected, haveMotion);
                }
              }

              if (device.capabilities[0] === 'notificationButton') { 
                const service = existingAccessory.getService(this.Service.ContactSensor);

                if (service!==undefined && device.lastEvents.notificationButton!==undefined) {
                  const isOn = device.lastEvents.notificationButton.value;
                  service.updateCharacteristic(this.Characteristic.ContactSensorState, isOn);
                }
              }

              if (device.capabilities[0] === 'temperature' || device.capabilities[0] === 'humidity') { 
      
                const serviceTemperature = existingAccessory.getService(this.Service.TemperatureSensor);
                if (serviceTemperature!==undefined && device.lastEvents.temperature!==undefined) {
                  const temperature = device.lastEvents.temperature.value;
                  serviceTemperature.getCharacteristic(this.Characteristic.CurrentTemperature).setProps({minValue: -100, maxValue: 100});
                  serviceTemperature.updateCharacteristic(this.Characteristic.CurrentTemperature, temperature);
                }

                const serviceHumidity = existingAccessory.getService(this.Service.HumiditySensor);
                if (serviceHumidity!==undefined && device.lastEvents.humidity!==undefined) {
                  const humidity = device.lastEvents.humidity.value;
                  serviceHumidity.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, humidity);
                }
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

          const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.localId(device));
  
          if (existingAccessory) {
            if (device) {
              this.log.info('Restoring existing accessory:', device.name);

              existingAccessory.displayName = device.name;

              if (device.capabilities[0] === 'switchBinary') { 
                new SwitchAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'notificationTwilight') { 
                new TwilightAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'notificationContact') { 
                new ContactAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'switchLevel') { 
                new SwitchLevelAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'notificationMotion') { 
                new MotionAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'notificationButton') { 
                new ButtonAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

              if (device.capabilities[0] === 'temperature' || device.capabilities[0] === 'humidity') { 
                new ThermometerAndHumidityAccessory(this, existingAccessory, device, this.config, this.log);
                this.api.updatePlatformAccessories([existingAccessory]);
              }

            } else if (!device) {
              this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
              this.log.info('Removing existing accessory:', existingAccessory.displayName);
            }
          } else {
            const accessory = new this.api.platformAccessory(device.name, this.localId(device));
            accessory.context.device = device;

            if (device.capabilities[0] === 'switchBinary') { 
              this.log.info('Adding new accessory:', device.name);

              new SwitchAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }

            if (device.capabilities[0] === 'notificationTwilight') { 
              this.log.info('Adding new accessory:', device.name);

              new TwilightAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            } 

            if (device.capabilities[0] === 'notificationContact') { 
              this.log.info('Adding new accessory:', device.name);

              new ContactAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            } 

            if (device.capabilities[0] === 'switchLevel') { 
              this.log.info('Adding new accessory:', device.name);

              new SwitchLevelAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }

            if (device.capabilities[0] === 'notificationMotion') { 
              this.log.info('Adding new accessory:', device.name);

              new MotionAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }

            if (device.capabilities[0] === 'notificationButton') { 
              this.log.info('Adding new accessory:', device.name);

              new ButtonAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }

            if (device.capabilities[0] === 'temperature' || device.capabilities[0] === 'humidity') { 
              this.log.info('Adding new accessory:', device.name);
              
              new ThermometerAndHumidityAccessory(this, accessory, device, this.config, this.log);
              this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
            }
          }
        }
      }

      this.accessories.forEach(accessory => {
        let found = false;

        for (const device of (<NexaObject[]>results)) {
          if (accessory.UUID === this.localId(device)) {
            found = true;
          }
        }

        if (found === false) {
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          this.log.info('Removing existing accessory:', accessory.displayName);
        }
      });
    });
  }

  localId(device:NexaObject):string {
    return this.api.hap.uuid.generate(device.id.toString()+'_'+device.name+'_'+device.capabilities[0]);
  }
}
