import { AbstractLoader, GrpcServiceDefinition } from '../loaders';

export class GrpcClient {
  public definition: GrpcServiceDefinition[] = [];

  constructor(private readonly loader: AbstractLoader) {}

  public async load() {
    this.definition = await this.loader.load();
  }
}
