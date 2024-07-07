import * as fs from 'node:fs';

import {
  AbstractProtocol,
  GrpcMetadata,
  GrpcRequest,
  GrpcRequestOptions,
  GrpcResponse,
  GrpcResponseData,
  GrpcStatus,
  isMutualTlsConfig,
  isServerSideTlsConfig,
} from '@getezy/grpc-core';
import * as grpc from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';
import lodashGet from 'lodash.get';
import { SetOptional } from 'type-fest';

import { GrpcMetadataParser } from './metadata-parser';
import { GrpcChannelOptions, GrpcProtocolOptions, isServiceClientConstructor } from './types';

export class GrpcProtocol extends AbstractProtocol<grpc.Metadata, grpc.MetadataValue> {
  private readonly grpcObject: grpc.GrpcObject;
  private readonly channelOptions?: GrpcChannelOptions;

  constructor(
    { channelOptions, ...options }: SetOptional<GrpcProtocolOptions, 'tls'>,
    packageDefinition: PackageDefinition
  ) {
    super(options, packageDefinition, new GrpcMetadataParser());

    this.grpcObject = grpc.loadPackageDefinition(packageDefinition);
    this.channelOptions = channelOptions;
  }

  public invokeUnaryRequest<
    Request extends GrpcRequest = GrpcRequest,
    Response extends GrpcResponseData = GrpcResponseData,
  >(options: GrpcRequestOptions, request: Request, metadata?: GrpcMetadata<grpc.MetadataValue>) {
    const client = this.createClient(options);

    return new Promise<GrpcResponse<Response>>((resolve) => {
      const call = client[options.method](
        request.data,
        this.metadataParser.parse(metadata),
        (error: grpc.ServerErrorResponse, response: Response) => {
          if (error) {
            return resolve({
              code: (error.code ?? GrpcStatus.UNKNOWN) as GrpcStatus,
              data: {
                details: error.details,
                metadata: error.metadata?.toJSON(),
              },
            });
          }

          return resolve({ code: GrpcStatus.OK, data: response });
        }
      ) as grpc.ClientUnaryCall;
    });
  }

  private createClient(options: GrpcRequestOptions) {
    const ServiceClient = lodashGet(this.grpcObject, options.service);

    if (ServiceClient && isServiceClientConstructor(ServiceClient)) {
      const client = new ServiceClient(
        this.options.address,
        this.getChannelCredentials(),
        this.getChannelOptions()
      );

      if (client[options.method] && typeof client[options.method] === 'function') {
        return client;
      }

      throw new Error(`Method "${options.method}" is not defined`);
    }

    throw new Error(`Service "${options.service}" is not defined`);
  }

  private getChannelCredentials(): grpc.ChannelCredentials {
    let credentials: grpc.ChannelCredentials;

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

  private getChannelOptions(): grpc.ChannelOptions {
    const channelOptions: grpc.ChannelOptions = {};

    if (this.channelOptions?.sslTargetNameOverride) {
      channelOptions['grpc.ssl_target_name_override'] = this.channelOptions.sslTargetNameOverride;
    }

    return channelOptions;
  }
}
