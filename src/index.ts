import { API } from 'homebridge';

import { PLATFORM_NAME } from './settings';
import { NexaHomebridgePlatform } from './platform'; 

export = (api: API) => {
  api.registerPlatform(PLATFORM_NAME, NexaHomebridgePlatform);
};