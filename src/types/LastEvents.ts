import { Battery } from './Battery';
import { Energy } from './Energy';
import { Humidity } from './Humidity';
import { Luminance } from './Luminance';
import { MethodCall } from './MethodCall';
import { NotificationButton } from './NotificationButton';
import { NotificationContact } from './NotificationContact';
import { NotificationMotion } from './NotificationMotion';
import { NotificationTamper } from './NotificationTamper';
import { NotificationTwilight } from './NotificationTwilight';
import { NotificationWater } from './NotificationWater';
import { Power } from './Power';
import { SwitchBinary } from './SwitchBinary';
import { SwitchLevel } from './SwitchLevel';
import { Temperature } from './Temperature';
import { Zwave } from './Zwave';

export interface LastEvents {
    switchBinary: SwitchBinary;
    methodCall: MethodCall;
    switchLevel: SwitchLevel;
    notificationContact: NotificationContact;
    notificationButton: NotificationButton;
    notificationTwilight: NotificationTwilight;
    notificationMotion: NotificationMotion;
    notificationWater: NotificationWater;
    notificationTamper: NotificationTamper; 
    temperature: Temperature;
    humidity: Humidity;
    luminance: Luminance;
    battery: Battery;
    zwave: Zwave;
    power: Power;
    energy: Energy;
}
