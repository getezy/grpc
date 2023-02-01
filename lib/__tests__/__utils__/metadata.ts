/* eslint-disable import/no-extraneous-dependencies */
import { v4 as uuid } from 'uuid';

import { AbstractMetadataParser, GrpcMetadataParser, GrpcWebMetadataParser } from '@protocols';

export enum MetadataType {
  Grpc = 'grpc',
  GrpcWeb = 'grpc-web',
}

export function generateMetadata(type: MetadataType, meta?: Record<string, unknown>) {
  const pureMetadata: Record<string, any> = {
    'x-access-token': uuid(),
    ...meta,
  };

  let parser: AbstractMetadataParser<any, any>;

  if (type === MetadataType.Grpc) {
    parser = new GrpcMetadataParser();
  } else {
    parser = new GrpcWebMetadataParser();
  }

  const metadata = parser.parse(pureMetadata);

  return {
    pureMetadata,
    metadata,
  };
}
