import { grpc } from '@improbable-eng/grpc-web';

import { AbstractMetadataParser } from '../abstract.metadata-parser';
import { GrpcWebMetadata, GrpcWebMetadataValue } from './interfaces';

export class GrpcWebMetadataParser extends AbstractMetadataParser<
  GrpcWebMetadataValue,
  GrpcWebMetadata
> {
  public parse(value?: Record<string, GrpcWebMetadataValue>): GrpcWebMetadata {
    if (value) {
      return Object.keys(value).reduce((metadata, key) => {
        metadata.set(key, value[key]);

        return metadata;
      }, new grpc.Metadata());
    }

    return new grpc.Metadata();
  }
}
