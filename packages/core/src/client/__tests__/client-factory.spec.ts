import { GrpcClient } from '../client';
import { GrpcClientFactory } from '../client.factory';

describe('GrpcClientFactory', () => {
  it('should create GrpcClient', async () => {
    const client = await GrpcClientFactory.create();

    expect(client).toBeInstanceOf(GrpcClient);
  });
});
