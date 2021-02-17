export interface Energy {
    scale: number;
    meterType: string;
    value: number;
    electricScale: string;
    sourceNode: number;
    fromWS: boolean;
    time: Date;
    name: string;
}