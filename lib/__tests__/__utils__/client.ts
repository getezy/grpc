import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { GrpcClientFactory } from '@client';
import { ProtobufLoader } from '@loaders';
import { AbstractProtocol, GrpcProtocol, GrpcTlsType, GrpcWebProtocol } from '@protocols';

export enum LoaderType {
  Protobuf = 'protobuf',
  Reflection = 'reflection',
}

export enum ProtocolType {
  Grpc = 'grpc',
  GrpcWeb = 'grpc-web',
}

function createLoader(loaderType: LoaderType) {
  switch (loaderType) {
    default:
      return new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));
  }
}

function createProtocol(protocolType: ProtocolType) {
  switch (protocolType) {
    case ProtocolType.GrpcWeb:
      return new GrpcWebProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.INSECURE },
      });
    case ProtocolType.Grpc:
    default:
      return new GrpcProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.INSECURE },
      });
  }
}

type AbstractProtocolMetadataValue<T> = T extends AbstractProtocol<infer MetadataValue, any>
  ? MetadataValue
  : T;
type AbstractProtocolMetadata<T> = T extends AbstractProtocol<any, infer Metadata> ? Metadata : T;

export async function createClient(loaderType: LoaderType, protocolType: ProtocolType) {
  const {
    SimpleUnaryRequest,
    SimpleServerStreamRequest,
    SimpleServerStream,
    SimpleClientStreamRequest,
    SimpleClientStream,
    SimpleBidirectionalStreamRequest,
    SimpleBidirectionalStream,
  } =
    // @ts-ignore
    // eslint-disable-next-line no-underscore-dangle
    grpc.__setSimpleServicePackageDefinition();

  const loader = createLoader(loaderType);

  const protocol = createProtocol(protocolType);
  const client = await GrpcClientFactory.create<
    AbstractProtocolMetadataValue<typeof protocol>,
    AbstractProtocolMetadata<typeof protocol>
  >(loader, protocol);

  return {
    client,
    SimpleUnaryRequest,
    SimpleClientStreamRequest,
    SimpleClientStream,
    SimpleServerStreamRequest,
    SimpleServerStream,
    SimpleBidirectionalStreamRequest,
    SimpleBidirectionalStream,
  };
}
