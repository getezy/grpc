// import * as fs from 'node:fs';

import {
  AbstractProtocol,
  GrpcRequestOptions,
  // isMutualTlsConfig,
  // isServerSideTlsConfig,
} from '@getezy/grpc-core';
import * as grpc from '@grpc/grpc-js';
import type { PackageDefinition } from '@grpc/proto-loader';

// import lodashGet from 'lodash.get';
import { GrpcChannelOptions, GrpcProtocolOptions } from './types';

export class GrpcProtocol extends AbstractProtocol {
  private grpcObject: grpc.GrpcObject;
  private channelOptions?: GrpcChannelOptions;

  constructor(
    { channelOptions, ...options }: GrpcProtocolOptions,
    packageDefinition: PackageDefinition
  ) {
    super(options, packageDefinition);

    this.channelOptions = channelOptions;
    this.grpcObject = grpc.loadPackageDefinition(packageDefinition);
  }

  public async invokeUnaryRequest(requestOptions: GrpcRequestOptions) {
    return Promise.resolve(requestOptions);
  }

  // private getMethod(requestOptions: GrpcRequestOptions) {
  //   const Service = lodashGet(this.grpcObject, requestOptions.service);

  //   if (Service && isServiceClientConstructor(Service)) {
  //     // const client = new Service('', '', {});
  //   }
  // }

  // private getChannelCredentials(): grpc.ChannelCredentials {
  //   let credentials: grpc.ChannelCredentials;

  //   if (isMutualTlsConfig(this.options.tls)) {
  //     const rootCert = this.options.tls.rootCertificatePath
  //       ? fs.readFileSync(this.options.tls.rootCertificatePath)
  //       : null;
  //     const clientCert = fs.readFileSync(this.options.tls.clientCertificatePath);
  //     const clientKey = fs.readFileSync(this.options.tls.clientKeyPath);
  //     credentials = grpc.credentials.createSsl(rootCert, clientKey, clientCert);
  //   } else if (isServerSideTlsConfig(this.options.tls)) {
  //     const rootCert = this.options.tls.rootCertificatePath
  //       ? fs.readFileSync(this.options.tls.rootCertificatePath)
  //       : null;
  //     credentials = grpc.credentials.createSsl(rootCert);
  //   } else {
  //     credentials = grpc.credentials.createInsecure();
  //   }

  //   return credentials;
  // }
}
