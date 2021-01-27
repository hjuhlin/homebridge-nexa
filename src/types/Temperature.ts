export interface Temperature {
    value: number;
    sourceNode: number;
    fromWS: boolean;
    time: Date;
    name: string;
}