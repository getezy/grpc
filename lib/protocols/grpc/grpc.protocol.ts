import type {
  ChannelCredentials,
  ChannelOptions,
  MetadataValue,
  ServerErrorResponse,
} from '@grpc/grpc-js';
import * as grpc from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import lodashGet from 'lodash.get';
import * as fs from 'node:fs';

import {
  AbstractProtocol,
  GrpcChannelOptions,
  GrpcProtocolOptions,
  GrpcRequestOptions,
  GrpcRequestValue,
  GrpcResponse,
  GrpcResponseValue,
  GrpcStatus,
  instanceOfServiceClientConstructor,
  isMutualTlsConfig,
  isServerSideTlsConfig,
} from '@protocols';

import { MetadataParser } from './grpc-metadata.parser';

export class GrpcProtocol extends AbstractProtocol {
  public readonly channelOptions?: GrpcChannelOptions;

  constructor({ channelOptions, ...options }: GrpcProtocolOptions) {
    super(options);

    this.channelOptions = channelOptions;
  }

  public invokeUnaryRequest<
    Request extends GrpcRequestValue = GrpcRequestValue,
    Response extends GrpcResponseValue = GrpcResponseValue
  >(
    packageDefinition: PackageDefinition,
    requestOptions: GrpcRequestOptions,
    payload: Request,
    metadata?: Record<string, MetadataValue>
  ): Promise<GrpcResponse<Response>> {
    const client = this.createClient(packageDefinition, requestOptions);
    return new Promise((resolve) => {
      const startTime = performance.now();
      client[requestOptions.method](
        payload,
        metadata ? MetadataParser.parse(metadata) : new grpc.Metadata(),
        (error: ServerErrorResponse, response: Response) => {
          const timestamp = Math.trunc(performance.now() - startTime);

          if (error) {
            return resolve({
              timestamp,
              code: error.code || GrpcStatus.UNKNOWN,
              value: {
                details: error.details,
                metadata: error.metadata?.toJSON(),
              },
            });
          }

          return resolve({ timestamp, code: GrpcStatus.OK, value: response });
        }
      );
    });
  }

  private createClient(packageDefinition: PackageDefinition, requestOptions: GrpcRequestOptions) {
    const ast = grpc.loadPackageDefinition(packageDefinition);
    const ServiceClient = lodashGet(ast, requestOptions.service);

    if (ServiceClient && instanceOfServiceClientConstructor(ServiceClient)) {
      const client = new ServiceClient(
        this.options.address,
        this.getChannelCredentials(),
        this.getChannelOptions()
      );

      if (client[requestOptions.method] && typeof client[requestOptions.method] === 'function') {
        return client;
      }

      throw new Error(`Method "${requestOptions.method}" not found in package definition`);
    }

    throw new Error(`Service "${requestOptions.service}" not found in package definition`);
  }

  private getChannelCredentials(): ChannelCredentials {
    let credentials: ChannelCredentials;

    if (isMutualTlsConfig(this.options.tls)) {
      const rootCert = this.options.tls.rootCertificatePath
        ? fs.readFileSync(this.options.tls.rootCertificatePath)
        : null;
      const clientCert = fs.readFileSync(this.options.tls.clientCertificatePath);
      const clientKey = fs.readFileSync(this.options.tls.clientKeyPath);
      credentials = grpc.credentials.createSsl(rootCert, clientKey, clientCert);
    } else if (isServerSideTlsConfig(this.options.tls)) {
      const rootCert = this.options.tls.rootCertificatePath
        ? fs.readFileSync(this.options.tls.rootCertificatePath)
        : null;
      credentials = grpc.credentials.createSsl(rootCert);
    } else {
      credentials = grpc.credentials.createInsecure();
    }

    return credentials;
  }

  private getChannelOptions(): ChannelOptions {
    const channelOptions: ChannelOptions = {};

    if (this.channelOptions?.sslTargetNameOverride) {
      channelOptions['grpc.ssl_target_name_override'] = this.channelOptions.sslTargetNameOverride;
    }

    return channelOptions;
  }
}
