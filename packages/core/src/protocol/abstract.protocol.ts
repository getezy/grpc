import type { PackageDefinition } from '@grpc/proto-loader';
import { SetOptional } from 'type-fest';

import { AbstractMetadataParser } from './abstract.metadata-parser';
import {
  AbstractProtocolOptions,
  GrpcRequest,
  GrpcRequestData,
  GrpcResponse,
  GrpcResponseData,
  GrpcTlsType,
} from './types';

export abstract class AbstractProtocol<MetadataValue, Metadata> {
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
    Request extends GrpcRequestData = GrpcRequestData,
    Response extends GrpcResponseData = GrpcResponseData,
  >(request: GrpcRequest<Request>): Promise<GrpcResponse<Response>>;

  protected parseMetadata(metadata?: Record<string, MetadataValue>): Metadata {
    return this.metadataParser.parse(metadata);
  }
}
