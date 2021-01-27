import { Humidity } from './Humidity';
import { MethodCall } from './MethodCall';
import { NotificationButton } from './NotificationButton';
import { NotificationContact } from './NotificationContact';
import { NotificationMotion } from './NotificationMotion';
import { NotificationTwilight } from './NotificationTwilight';
import { SwitchBinary } from './SwitchBinary';
import { SwitchLevel } from './SwitchLevel';
import { Temperature } from './Temperature';

export interface LastEvents {
    switchBinary: SwitchBinary;
    methodCall: MethodCall;
    switchLevel: SwitchLevel;
    notificationContact: NotificationContact;
    notificationButton: NotificationButton;
    notificationTwilight: NotificationTwilight;
    notificationMotion: NotificationMotion;
    temperature: Temperature;
    humidity: Humidity;
}
