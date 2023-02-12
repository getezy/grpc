import { Metadata } from '@grpc/grpc-js';

import { AbstractMetadataParser } from '../abstract.metadata-parser';
import { GrpcMetadata, GrpcMetadataValue } from './interfaces';

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
