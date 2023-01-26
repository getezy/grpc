import { GrpcClient } from '@client';
import { AbstractLoader } from '@loaders';
import { AbstractProtocol } from '@protocols';

export class GrpcClientFactory {
  public static async create(
    loader: AbstractLoader,
    protocol: AbstractProtocol
  ): Promise<GrpcClient> {
    const client = new GrpcClient(loader, protocol);

    await client.init();

    return client;
  }
}
