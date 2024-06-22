import type { PackageDefinition } from '@grpc/proto-loader';
import { SetOptional } from 'type-fest';

import { AbstractProtocolOptions, GrpcRequestOptions, GrpcTlsType } from './types';

export abstract class AbstractProtocol {
  protected readonly options: AbstractProtocolOptions;

  constructor(
    options: SetOptional<AbstractProtocolOptions, 'tls'>,
    protected readonly packageDefinition: PackageDefinition
  ) {
    this.options = {
      tls: { type: GrpcTlsType.INSECURE },
      ...options,
    };
  }

  public abstract invokeUnaryRequest(
    requestOptions: GrpcRequestOptions
  ): Promise<Record<string, unknown>>;
}
