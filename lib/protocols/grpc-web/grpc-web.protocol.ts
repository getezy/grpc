import type { PackageDefinition, ServiceDefinition } from '@grpc/proto-loader';
import { grpc } from '@improbable-eng/grpc-web';
import * as fs from 'fs';
import * as https from 'https';
import lodashGet from 'lodash.get';
import { performance } from 'perf_hooks';
import { SetOptional } from 'type-fest';

import {
  AbstractProtocol,
  AbstractProtocolOptions,
  BidirectionalStream,
  ClientStream,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
  GrpcStatus,
  isInsecureTlsConfig,
  isMutualTlsConfig,
  isServerSideTlsConfig,
  ServerStream,
} from '@protocols';

import { GrpcWebError } from './grpc-web.error';
import { GrpcWebCallStream } from './grpc-web-call.stream';
import { GrpcWebMetadataParser } from './grpc-web-metadata.parser';
import { GrpcWebMetadataValue, instanceOfProtobufMethodDefinition } from './interfaces';

export class GrpcWebProtocol extends AbstractProtocol<GrpcWebMetadataValue, grpc.Metadata> {
  constructor(options: SetOptional<AbstractProtocolOptions, 'tls'>) {
    super(options, new GrpcWebMetadataParser());
  }

  public invokeUnaryRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, GrpcWebMetadataValue>
  ): Promise<GrpcResponse<Response>> {
    const methodDefinition = this.loadMethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage>(
      packageDefinition,
      requestOptions
    );

    return new Promise((resolve) => {
      const startTime = performance.now();
      const call = new GrpcWebCallStream(
        methodDefinition,
        {
          host: this.getUrl(),
          // @ts-ignore
          request: {
            // @ts-ignore
            serializeBinary: () => methodDefinition.requestType.serializeBinary(payload),
          },
          metadata: this.parseMetadata(metadata),
        },
        this.getRequestOptions()
      );

      call.on('response', (message) => {
        const timestamp = Math.trunc(performance.now() - startTime);
        resolve({ timestamp, code: GrpcStatus.OK, data: message });
      });

      call.on('error', (error) => {
        const timestamp = Math.trunc(performance.now() - startTime);
        resolve({
          code: error.code as unknown as GrpcStatus,
          timestamp,
          data: error.toObject(),
        });
      });
    });
  }

  public invokeServerStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, GrpcWebMetadataValue>
  ): ServerStream<Response> {
    const methodDefinition = this.loadMethodDefinition<grpc.ProtobufMessage, grpc.ProtobufMessage>(
      packageDefinition,
      requestOptions
    );

    const emitter = new ServerStream();

    const call = new GrpcWebCallStream(
      methodDefinition,
      {
        host: this.getUrl(),
        // @ts-ignore
        request: {
          // @ts-ignore
          serializeBinary: () => methodDefinition.requestType.serializeBinary(payload),
        },
        metadata: this.parseMetadata(metadata),
      },
      this.getRequestOptions()
    );

    this.subsribeOnServerStreamingEvents(emitter, call);

    return emitter;
  }

  private subsribeOnServerStreamingEvents<Response extends GrpcResponseValue = GrpcResponseValue>(
    emitter: ServerStream<Response>,
    call: GrpcWebCallStream
  ) {
    call.on('response', (response) => {
      emitter.emit('response', {
        code: GrpcStatus.OK,
        timestamp: new Date().getTime(),
        data: response,
      });
    });

    call.on('error', (error: GrpcWebError) => {
      emitter.emit('error', {
        code: error.code as unknown as GrpcStatus,
        timestamp: new Date().getTime(),
        data: error.toObject(),
      });
    });

    call.on('end', () => {
      emitter.emit('end');
    });

    emitter.on('cancel', () => {
      call.cancel();
    });
  }

  public invokeClientStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(): ClientStream<Request, Response> {
    throw new Error(`gRPC-Web doesn't support client streaming requests.`);
  }

  public invokeBidirectionalStreamingRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(): BidirectionalStream<Request, Response> {
    throw new Error(`gRPC-Web doesn't support bidirectional streaming requests.`);
  }

  private loadMethodDefinition<
    RequestType extends grpc.ProtobufMessage,
    ResponseType extends grpc.ProtobufMessage
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions
  ): grpc.MethodDefinition<RequestType, ResponseType> {
    const service = lodashGet(packageDefinition, requestOptions.service) as ServiceDefinition;

    if (service) {
      const method = lodashGet(service, requestOptions.method);

      if (method && instanceOfProtobufMethodDefinition<RequestType, ResponseType>(method)) {
        const serviceDefinition: grpc.ServiceDefinition = {
          serviceName: requestOptions.service,
        };

        const methodDefinition: grpc.MethodDefinition<RequestType, ResponseType> = {
          methodName: requestOptions.method,
          service: serviceDefinition,
          requestStream: method.requestStream,
          responseStream: method.responseStream,
          requestType: {
            // @ts-ignore
            serializeBinary: method.requestSerialize,
          },
          // @ts-ignore
          responseType: {
            deserializeBinary: method.responseDeserialize,
          },
        };

        return methodDefinition;
      }

      throw new Error(`Method "${requestOptions.method}" not found in package definition`);
    }

    throw new Error(`Service "${requestOptions.service}" not found in package definition`);
  }

  private getRequestOptions(): https.RequestOptions {
    let options: https.RequestOptions = {};

    if (isMutualTlsConfig(this.options.tls)) {
      const rootCert = this.options.tls.rootCertificatePath
        ? fs.readFileSync(this.options.tls.rootCertificatePath)
        : undefined;
      const clientCert = fs.readFileSync(this.options.tls.clientCertificatePath);
      const clientKey = fs.readFileSync(this.options.tls.clientKeyPath);

      options = {
        ca: rootCert,
        cert: clientCert,
        key: clientKey,
      };
    } else if (isServerSideTlsConfig(this.options.tls)) {
      const rootCert = this.options.tls.rootCertificatePath
        ? fs.readFileSync(this.options.tls.rootCertificatePath)
        : undefined;

      options = {
        ca: rootCert,
      };
    }

    return options;
  }

  private getUrl() {
    if (this.options.address.startsWith('http://') || this.options.address.startsWith('https://')) {
      return this.options.address;
    }

    if (isInsecureTlsConfig(this.options.tls)) {
      return `http://${this.options.address}`;
    }

    return `https://${this.options.address}`;
  }
}
