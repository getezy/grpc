import { AbstractLoader } from '@loader';
import { AbstractProtocol } from '@protocol';

export class GrpcClient {
  constructor(
    private readonly loader: AbstractLoader,
    private readonly protocol: AbstractProtocol
  ) {}

  public async init(): Promise<void> {
    await this.loader.load();
  }
}
