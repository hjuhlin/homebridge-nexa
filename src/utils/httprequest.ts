const request = require('request');

import { PlatformConfig } from 'homebridge';

export class HttpRequest {

  readonly urlForDeviceStatus = `http://${this.config['ip']}/v1/nodes?field=lastEvents&timeout=20000`;
  readonly urlForDeviceControll = `http://${this.config['ip']}/v1/nodes/{id}/call?timeout=20000`;

 
  constructor(
    public readonly config: PlatformConfig,
  ) {}

  createInstance() {
    return {};
  }

  GetStatusList() {
    return new Promise((resolve, reject) => {
      request(
        {
          url: this.urlForDeviceStatus,
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
          url: this.urlForDeviceControll.replace('{id}', id.toString()),
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