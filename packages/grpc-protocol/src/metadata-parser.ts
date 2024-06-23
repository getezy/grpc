import { AbstractMetadataParser } from '@getezy/grpc-core';
import { Metadata } from '@grpc/grpc-js';

import { GrpcMetadata, GrpcMetadataValue } from './types';

export class GrpcMetadataParser extends AbstractMetadataParser<GrpcMetadataValue, GrpcMetadata> {
  public parse(value?: Record<string, GrpcMetadataValue>): GrpcMetadata {
    if (value) {
      return Object.keys(value).reduce((metadata, key) => {
        metadata.set(key, value[key]);

        return metadata;
      }, new Metadata());
    }

    return new Metadata();
  }
}
