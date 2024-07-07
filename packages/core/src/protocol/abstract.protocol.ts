import type { PackageDefinition } from '@grpc/proto-loader';
import { SetOptional } from 'type-fest';

import { AbstractMetadataParser } from './abstract.metadata-parser';
import {
  AbstractProtocolOptions,
  GrpcMetadata,
  GrpcRequest,
  GrpcRequestOptions,
  GrpcResponse,
  GrpcResponseData,
  GrpcTlsType,
} from './types';

export abstract class AbstractProtocol<Metadata, MetadataValue = unknown> {
  protected readonly options: AbstractProtocolOptions;

  constructor(
    options: SetOptional<AbstractProtocolOptions, 'tls'>,
    protected readonly packageDefinition: PackageDefinition,
    protected readonly metadataParser: AbstractMetadataParser<MetadataValue, Metadata>
  ) {
    this.options = {
      tls: { type: GrpcTlsType.INSECURE },
      ...options,
    };
  }

  public abstract invokeUnaryRequest<
    Request extends GrpcRequest = GrpcRequest,
    Response extends GrpcResponseData = GrpcResponseData,
  >(
    options: GrpcRequestOptions,
    request: Request,
    metadata?: GrpcMetadata<MetadataValue>
  ): Promise<GrpcResponse<Response>>;
}
