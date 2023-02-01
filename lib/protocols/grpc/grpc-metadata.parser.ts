import { Metadata, MetadataValue } from '@grpc/grpc-js';

import { AbstractMetadataParser } from '../abstract.metadata-parser';

export class GrpcMetadataParser extends AbstractMetadataParser<MetadataValue, Metadata> {
  public parse(value?: Record<string, MetadataValue>): Metadata {
    if (value) {
      return Object.keys(value).reduce((metadata, key) => {
        metadata.set(key, value[key]);

        return metadata;
      }, new Metadata());
    }

    return new Metadata();
  }
}
