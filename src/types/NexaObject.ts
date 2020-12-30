import { ExtraInfo } from './ExtraInfo';
import { LastEvents } from './LastEvents';
import { ZwaveInfo } from './ZwaveInfo';

export interface NexaObject {
    includedSecurely: boolean;
    id: number;
    type: string;
    hideInApp: boolean;
    ignoreInRoomAction: boolean;
    broken: boolean;
    locked: boolean;
    roomId: number;
    groupNode: number;
    prio: number;
    favorite: boolean;
    lastPing: any;
    capabilities: string[];
    zwaveInfo: ZwaveInfo;
    lastEvents: LastEvents;
    name: string;
    extraInfo: ExtraInfo;
    tags: string[];
    periodicEvents: any[];
}

