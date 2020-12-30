import { MethodCall } from './MethodCall';
import { NotificationButton } from './NotificationButton';
import { NotificationContact } from './NotificationContact';
import { NotificationTwilight } from './NotificationTwilight';
import { SwitchBinary } from './SwitchBinary';
import { SwitchLevel } from './SwitchLevel';

export interface LastEvents {
    switchBinary: SwitchBinary;
    methodCall: MethodCall;
    notificationContact: NotificationContact;
    notificationButton: NotificationButton;
    notificationTwilight: NotificationTwilight;
    switchLevel: SwitchLevel;
}
