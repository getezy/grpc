import { GrpcMetadata } from './types';

export abstract class AbstractMetadataParser<Value, Metadata> {
  public abstract parse(value?: GrpcMetadata<Value>): Metadata;
}
