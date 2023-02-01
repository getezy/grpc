import { AbstractLoader } from '@loaders';
import {
  AbstractProtocol,
  BidirectionalStream,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
  ServerStream,
} from '@protocols';

export class GrpcClient<MetadataValue, Metadata> {
  constructor(
    private readonly loader: AbstractLoader,
    private readonly protocol: AbstractProtocol<MetadataValue, Metadata>
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

  public invokeServerStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    options: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): ServerStream<Response> {
    const packageDefinition = this.loader.getPackageDefinition();

    return this.protocol.invokeServerStreamingRequest(
      packageDefinition,
      options,
      payload,
      metadata
    );
  }

  public invokeBidirectionalStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    options: GrpcRequestOptions,
    metadata?: Record<string, MetadataValue>
  ): BidirectionalStream<Request, Response> {
    const packageDefinition = this.loader.getPackageDefinition();

    return this.protocol.invokeBidirectionalStreamingRequest(packageDefinition, options, metadata);
  }
}
