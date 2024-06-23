import { GrpcStatus } from '../../types';

export type GrpcResponseData = Record<string, unknown>;

export type GrpcResponse<Data extends GrpcResponseData = GrpcResponseData> = {
  code: GrpcStatus;

  data: Data;
};
