import type { MetadataValue } from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import { Duplex, Readable } from 'node:stream';

import {
  AbstractProtocolOptions,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
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

  // TODO: add types for stream "on" handlers
  public abstract invokeServerStreamingRequest<Request extends GrpcRequestValue = GrpcRequestValue>(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): Readable;

  // TODO: add types for stream "on" handlers
  public abstract invokeBidirectionalStreamingRequest(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): Duplex;
}
