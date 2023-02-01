import { GrpcClient } from '@client';
import { AbstractLoader } from '@loaders';
import { AbstractProtocol } from '@protocols';

export class GrpcClientFactory {
  public static async create<MetadataValue, Metadata>(
    loader: AbstractLoader,
    protocol: AbstractProtocol<MetadataValue, Metadata>
  ): Promise<GrpcClient<MetadataValue, Metadata>> {
    const client = new GrpcClient(loader, protocol);

    await client.init();

    return client;
  }
}
