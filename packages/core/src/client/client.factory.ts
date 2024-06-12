import { GrpcClient } from './client';

export class GrpcClientFactory {
  public static async create(): Promise<GrpcClient> {
    await Promise.resolve();
    return new GrpcClient();
  }
}
