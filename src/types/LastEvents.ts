import { MethodCall } from './MethodCall';
import { NotificationButton } from './NotificationButton';
import { NotificationContact } from './NotificationContact';
import { NotificationMotion } from './NotificationMotion';
import { NotificationTwilight } from './NotificationTwilight';
import { SwitchBinary } from './SwitchBinary';
import { SwitchLevel } from './SwitchLevel';

export interface LastEvents {
    switchBinary: SwitchBinary;
    methodCall: MethodCall;
    switchLevel: SwitchLevel;
    notificationContact: NotificationContact;
    notificationButton: NotificationButton;
    notificationTwilight: NotificationTwilight;
    notificationMotion: NotificationMotion;
}
