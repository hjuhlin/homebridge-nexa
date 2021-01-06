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
            const uuid = this.api.hap.uuid.generate(device.id.toString()+'_'+device.name);
            const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);

            if (existingAccessory!== undefined) {
            
              if (device.capabilities[0] === 'switchBinary') {  
                const service = existingAccessory.getService(this.Service.Switch);

                if (service!==undefined && device.lastEvents.switchBinary!==undefined) {
                  //Refector this in some way so API isn't called with same data. 
                  const isOn = device.lastEvents.switchBinary.value;
                  service.getCharacteristic(this.Characteristic.On).updateValue(isOn);
                }
              }

              if (device.capabilities[0] === 'notificationTwilight') {  
                const service = existingAccessory.getService(this.Service.LightSensor);

                if (service!==undefined && device.lastEvents.notificationTwilight !== undefined) {
                  const IsNight = device.lastEvents.notificationTwilight.value;
                  service.getCharacteristic(this.Characteristic.CurrentAmbientLightLevel).updateValue(IsNight ? 1: 100);
                }
              }

              if (device.capabilities[0] === 'notificationContact') { 
                const service = existingAccessory.getService(this.Service.ContactSensor);

                if (service!==undefined && device.lastEvents.notificationContact!==undefined) {
                  const IsOpen = device.lastEvents.notificationContact.value;
                  service.getCharacteristic(this.Characteristic.ContactSensorState).updateValue(IsOpen);
                }
              }

              if (device.capabilities[0] === 'switchLevel') { 
                const service = existingAccessory.getService(this.Service.Lightbulb);

                if (service!==undefined && device.lastEvents.switchLevel!==undefined) {
                  const Brightness = device.lastEvents.switchLevel.value*100;

                  service.getCharacteristic(this.Characteristic.Brightness).updateValue(Brightness);
                }
              }

              if (device.capabilities[0] === 'notificationMotion') { 
                const service = existingAccessory.getService(this.Service.MotionSensor);

                if (service!==undefined && device.lastEvents.notificationMotion!==undefined) {
                  const HaveMotion = device.lastEvents.notificationMotion.value;

                  service.getCharacteristic(this.Characteristic.MotionDetected).updateValue(HaveMotion);
                }
              }

              if (device.capabilities[0] === 'notificationButton') { 
                const service = existingAccessory.getService(this.Service.Switch);

                if (service!==undefined && device.lastEvents.notificationButton!==undefined) {
                  const IsOn = device.lastEvents.notificationButton.value;

                  if (service.getCharacteristic(this.Characteristic.On).value!==IsOn) {
                    service.getCharacteristic(this.Characteristic.On).updateValue(IsOn);
                  }
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

          const uuid = this.api.hap.uuid.generate(device.id.toString()+'_'+device.name);
          const existingAccessory = this.accessories.find(accessory => accessory.UUID === uuid);
  
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
            } else if (!device) {
              this.api.unregisterPlatformAccessories(PLUGIN_NAME, PLATFORM_NAME, [existingAccessory]);
              this.log.info('Removing existing accessory:', existingAccessory.displayName);
            }
          } else {
            const accessory = new this.api.platformAccessory(device.name, uuid);
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
          }
        }
      }

      this.accessories.forEach(accessory => {
        let found = false;

        for (const device of (<NexaObject[]>results)) {
          if (accessory.UUID === this.api.hap.uuid.generate(device.id.toString()+'_'+device.name)) {
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
}
