import { grpc } from '@improbable-eng/grpc-web';

import { AbstractMetadataParser } from '../abstract.metadata-parser';
import { GrpcWebMetadataValue } from './interfaces';

export class GrpcWebMetadataParser extends AbstractMetadataParser<
  GrpcWebMetadataValue,
  grpc.Metadata
> {
  public parse(value?: Record<string, GrpcWebMetadataValue>): grpc.Metadata {
    if (value) {
      return Object.keys(value).reduce((metadata, key) => {
        metadata.set(key, value[key]);

        return metadata;
      }, new grpc.Metadata());
    }

    return new grpc.Metadata();
  }
}
