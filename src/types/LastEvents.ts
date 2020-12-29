import { MethodCall } from './MethodCall';
import { NotificationContact } from './NotificationContact';
import { NotificationTwilight } from './NotificationTwilight';
import { SwitchBinary } from './SwitchBinary';

export interface LastEvents {
    switchBinary: SwitchBinary;
    methodCall: MethodCall;
    notificationContact: NotificationContact;
    notificationTwilight: NotificationTwilight;
}
