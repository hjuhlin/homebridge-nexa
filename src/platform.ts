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
            for (let c = 0; c<device.capabilities.length;c++) {
              const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.localId(device, c));
              
              if (existingAccessory) {
                if (device.capabilities[c] === 'switchBinary') {  
                  const service = existingAccessory.getService(this.Service.Switch);

                  if (service!==undefined && device.lastEvents.switchBinary!==undefined) {
                    const isOn = device.lastEvents.switchBinary.value;

                    if (service.getCharacteristic(this.Characteristic.TimeUpdate).value===false) {
                      service.updateCharacteristic(this.Characteristic.On, isOn);
                    }
                  }
                }

                if (device.capabilities[c] === 'notificationTwilight') {  
                  const service = existingAccessory.getService(this.Service.LightSensor);

                  if (service!==undefined && device.lastEvents.notificationTwilight !== undefined) {
                    const isNight = device.lastEvents.notificationTwilight.value;
                    service.updateCharacteristic(this.Characteristic.CurrentAmbientLightLevel, isNight ? 1: 100);
                  }
                }

                if (device.capabilities[c] === 'notificationContact') { 
                  const service = existingAccessory.getService(this.Service.ContactSensor);

                  if (service!==undefined && device.lastEvents.notificationContact!==undefined) {
                    const isOpen = device.lastEvents.notificationContact.value;
                    service.updateCharacteristic(this.Characteristic.ContactSensorState, isOpen);
                  }
                }

                if (device.capabilities[c] === 'notificationMotion') { 
                  const service = existingAccessory.getService(this.Service.MotionSensor);

                  if (service!==undefined && device.lastEvents.notificationMotion!==undefined) {
                    const haveMotion = device.lastEvents.notificationMotion.value;
                    service.updateCharacteristic(this.Characteristic.MotionDetected, haveMotion);
                  }
                }

                if (device.capabilities[c] === 'notificationButton') { 
                  const service = existingAccessory.getService(this.Service.ContactSensor);

                  if (service!==undefined && device.lastEvents.notificationButton!==undefined) {
                    const isOn = device.lastEvents.notificationButton.value;
                    service.updateCharacteristic(this.Characteristic.ContactSensorState, isOn);
                  }
                }

                if (device.capabilities[c] === 'temperature') { 
                  const serviceTemperature = existingAccessory.getService(this.Service.TemperatureSensor);

                  if (serviceTemperature!==undefined && device.lastEvents.temperature!==undefined) {
                    const temperature = device.lastEvents.temperature.value;
                    serviceTemperature.getCharacteristic(this.Characteristic.CurrentTemperature).setProps({minValue: -100, maxValue: 100});
                    serviceTemperature.updateCharacteristic(this.Characteristic.CurrentTemperature, temperature);
                  }
                }

                if (device.capabilities[c] === 'humidity') { 
                  const serviceHumidity = existingAccessory.getService(this.Service.HumiditySensor);

                  if (serviceHumidity!==undefined && device.lastEvents.humidity!==undefined) {
                    const humidity = device.lastEvents.humidity.value;
                    serviceHumidity.updateCharacteristic(this.Characteristic.CurrentRelativeHumidity, humidity);
                  }
                }

                // if (device.capabilities[0] === 'switchLevel') { 
                //   const service = existingAccessory.getService(this.Service.Lightbulb);

                //   if (service!==undefined && device.lastEvents.switchLevel!==undefined) {
                //     if (service.getCharacteristic(this.Characteristic.TimeUpdate).value===false) { 

                //       const brightness = device.lastEvents.switchLevel.value*100;
                //       service.updateCharacteristic(this.Characteristic.Brightness, brightness);
                //       service.updateCharacteristic(this.Characteristic.On, brightness>0);
                //     }
                //   }
                // }                
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
            for (let c = 0; c<device.capabilities.length; c++) {

              if (device.capabilities[c] === 'switchBinary' || 
                  device.capabilities[c] === 'notificationTwilight' || 
                  device.capabilities[c] === 'notificationContact'|| 
                  device.capabilities[c] === 'notificationMotion' ||
                  device.capabilities[c] === 'notificationButton'||
                  device.capabilities[c] === 'temperature'|| 
                  device.capabilities[c] === 'humidity') {

                const existingAccessory = this.accessories.find(accessory => accessory.UUID === this.localId(device, c));
                const accessory = new this.api.platformAccessory(device.name, this.localId(device, c));
              
                if (device.capabilities[c] === 'switchBinary') { 
                  new SwitchAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'notificationTwilight') { 
                  new TwilightAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'notificationContact') { 
                  new ContactAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'notificationMotion') { 
                  new MotionAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'notificationButton') { 
                  new ButtonAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'temperature') { 
                  new ThermometerAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (device.capabilities[c] === 'humidity') { 
                  new HumidityAccessory(this, existingAccessory?existingAccessory:accessory, device, this.config, this.log);
                }

                if (existingAccessory) {
                  existingAccessory.displayName = device.name;

                  this.log.info('Restoring existing accessory:', device.name +' ('+device.capabilities[c]+')');
                  this.api.updatePlatformAccessories([existingAccessory]);
                
                } else {
                  accessory.context.device = device;

                  this.log.info('Adding new accessory:', device.name +' ('+device.capabilities[c]+')');
                  this.api.registerPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
                }
              } else {
                this.log.error('No support for:', device.name +' ('+device.capabilities[c]+')');
              }
            }
          }
        }
      }

      this.accessories.forEach(accessory => {
        let found = false;

        for (const device of (<NexaObject[]>results)) {
          for (let c = 0; c<device.capabilities.length;c++) {
            if (accessory.UUID === this.localId(device, c)) {
              found = true;
            }
          }
        }

        if (found === false) {
          this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [accessory]);
          this.log.info('Removing existing accessory:', accessory.displayName);
        }
      });
    });
  }

  localId(device:NexaObject, c:number):string {
    return this.api.hap.uuid.generate(device.id.toString()+'_'+device.name+'_'+device.capabilities[c]+'_v1.5');
  }
}
