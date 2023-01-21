import { GrpcServiceDefinition } from './interfaces';

export abstract class AbstractLoader {
  public abstract load(): Promise<GrpcServiceDefinition[]>;
}
