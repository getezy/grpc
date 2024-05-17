import type { PackageDefinition } from '@grpc/proto-loader';
import { SetOptional } from 'type-fest';

import {
  AbstractMetadataParser,
  AbstractProtocolOptions,
  BidirectionalStream,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
  GrpcTlsType,
  ServerStream,
} from '@protocols';

/**
 * AbstractProtocol used for make queries to grpc server
 */
export abstract class AbstractProtocol<MetadataValue, Metadata> {
  protected readonly options: AbstractProtocolOptions;

  constructor(
    options: SetOptional<AbstractProtocolOptions, 'tls'>,
    protected readonly metadataParser: AbstractMetadataParser<MetadataValue, Metadata>
  ) {
    this.options = {
      tls: { type: GrpcTlsType.INSECURE },
      ...options,
    };
  }

  public abstract invokeUnaryRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue,
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): Promise<GrpcResponse<Response>>;

  public abstract invokeClientStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue,
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): ClientStream<Request, Response>;

  public abstract invokeServerStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue,
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): ServerStream<Response>;

  public abstract invokeBidirectionalStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue,
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): BidirectionalStream<Request, Response>;

  protected parseMetadata(metadata?: Record<string, MetadataValue>): Metadata {
    return this.metadataParser.parse(metadata);
  }
}
