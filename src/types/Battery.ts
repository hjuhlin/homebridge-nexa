export interface Battery {
    battLow: boolean;
    batteryPercent: number;
    value: number;
    sourceNode: number;
    fromWS: boolean;
    time: Date;
    name: string;
}