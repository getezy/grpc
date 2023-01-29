import { GrpcStatus } from '@protocols';

// export interface GrpcErrorResponseValue {
//   details?: string;
//   metadata?: Record<string, unknown>;
// }

// export type GrpcResponseValue = Record<string, unknown>;

// export interface GrpcResponse<Response extends GrpcResponseValue = GrpcResponseValue> {
//   code: GrpcStatus;

//   timestamp: number;

//   value: Response | GrpcErrorResponseValue;
// }

export interface GrpcErrorResponseValue {
  details?: string;
  metadata?: Record<string, unknown>;
}

export type GrpcResponseValue = Record<string, unknown>;

export interface GrpcResponse<Response extends GrpcResponseValue = GrpcResponseValue> {
  /**
   * Status code of gRPC request
   */
  code: GrpcStatus;

  /**
   * For unary requests - query execution time in milliseconds.
   * For streaming requests - receiving response actual time in utc.
   */
  timestamp: number;

  data: Response | GrpcErrorResponseValue;
}
