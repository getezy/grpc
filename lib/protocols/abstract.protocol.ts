import type { MetadataValue } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';

import {
  AbstractProtocolOptions,
  BidirectionalStream,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
  ServerStream,
} from '@protocols';

/**
 * AbstractProtocol used for make queries to grpc server
 */
export abstract class AbstractProtocol {
  constructor(protected readonly options: AbstractProtocolOptions) {}

  public abstract invokeUnaryRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): Promise<GrpcResponse<Response>>;

  public abstract invokeClientStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): ClientStream<Request, Response>;

  public abstract invokeServerStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): ServerStream<Response>;

  public abstract invokeBidirectionalStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): BidirectionalStream<Request, Response>;
}
