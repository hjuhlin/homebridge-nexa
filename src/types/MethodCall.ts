

export interface MethodCall {
    cap: string;
    targetNode: number;
    targetRoomId: number;
    method: string;
    sourceNode: number;
    fromWS: boolean;
    time: Date;
    name: string;
    arguments: number[];
}
