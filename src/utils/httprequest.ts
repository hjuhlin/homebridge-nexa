const request = require('request');

import { PlatformConfig, Logger } from 'homebridge';

export class HttpRequest {

  readonly urlStatusAllDevices = `http://${this.config['ip']}/v1/nodes?field=lastEvents&timeout=5000`;
  readonly urlStatusDevice = `http://${this.config['ip']}/v1/nodes/{id}?timeout=5000`;
  readonly urlUpdateDevice = `http://${this.config['ip']}/v1/nodes/{id}/call?timeout=500`;

 
  constructor(
    public readonly config: PlatformConfig,
    public readonly log: Logger,
  ) {}

  createInstance() {
    return {};
  }

  GetStatusListForAll() {
    return new Promise((resolve, reject) => {
      request(
        {
          url: this.urlStatusAllDevices,
          method: 'GET',
          auth: {
            user: 'nexa',
            pass: 'nexa',
            sendImmediately: false,
          },
          json: true,
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
    });
  }

  GetStatus(id: number) {
    return new Promise((resolve, reject) => {

      //this.log.info(this.urlStatusDevice.replace('{id}', id.toString()));

      request(
        {
          url: this.urlStatusDevice.replace('{id}', id.toString()),
          method: 'GET',
          auth: {
            user: 'nexa',
            pass: 'nexa',
            sendImmediately: false,
          },
          json: true,
        }, (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        });
    });
  }

  Update(id: number, body) {
    return new Promise((resolve, reject) => {

      request(
        {
          url: this.urlUpdateDevice.replace('{id}', id.toString()),
          method: 'POST',
          body: body,
          auth: {
            user: 'nexa',
            pass: 'nexa',
            sendImmediately: false,
          },
          json: true,
        },
        (error, response, body) => {
          if (error) {
            reject(error);
          } else {
            resolve(body);
          }
        },
      );
    });
  }
}