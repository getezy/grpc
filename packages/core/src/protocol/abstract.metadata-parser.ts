export abstract class AbstractMetadataParser<Value, Metadata> {
  public abstract parse(value?: Record<string, Value>): Metadata;
}
