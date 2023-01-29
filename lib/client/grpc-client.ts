import type { MetadataValue } from '@grpc/grpc-js';

import { AbstractLoader } from '@loaders';
import {
  AbstractProtocol,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
} from '@protocols';

export class GrpcClient {
  constructor(
    private readonly loader: AbstractLoader,
    private readonly protocol: AbstractProtocol
  ) {}

  async init() {
    await this.loader.load();
  }

  public invokeUnaryRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    options: GrpcRequestOptions,
    request: Request,
    metadata?: Record<string, MetadataValue>
  ): Promise<GrpcResponse<Response>> {
    const packageDefinition = this.loader.getPackageDefinition();

    return this.protocol.invokeUnaryRequest(packageDefinition, options, request, metadata);
  }

  public invokeClientStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    options: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): ClientStream<Request, Response> {
    const packageDefinition = this.loader.getPackageDefinition();

    return this.protocol.invokeClientStreamingRequest(packageDefinition, options, metadata);
  }
}
