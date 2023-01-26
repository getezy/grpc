export interface GrpcErrorResponseValue {
  details?: string;
  metadata?: Record<string, unknown>;
}

export type GrpcResponseValue = Record<string, unknown>;

export interface GrpcResponse<Response extends GrpcResponseValue = GrpcResponseValue> {
  code: number;

  timestamp: number;

  value: Response | GrpcErrorResponseValue;
}
