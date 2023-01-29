/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { GrpcClient, GrpcClientFactory } from '@client';
import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcStatus, GrpcTlsType } from '@protocols';

describe('GrpcClient', () => {
  let client: GrpcClient;
  let clientStream: any;

  beforeAll(async () => {
    // @ts-ignore
    const { SimpleClientStream } = grpc.__setSimpleServicePackageDefinition();
    clientStream = SimpleClientStream;

    client = await GrpcClientFactory.create(
      new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto')),
      new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } })
    );
  });

  it('should invoke unary request', async () => {
    const response = await client.invokeUnaryRequest(
      {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleUnaryRequest',
      },
      { id: '962af482-13c2-4084-a1fe-4eb135378d67' }
    );

    expect(response).toStrictEqual({
      code: GrpcStatus.OK,
      timestamp: 0,
      data: { id: '962af482-13c2-4084-a1fe-4eb135378d67' },
    });
  });

  it('should invoke client streaming request', async () => {
    const call = client.invokeClientStreamingRequest({
      service: 'simple_package.v1.SimpleService',
      method: 'SimpleClientStreamRequest',
    });

    const spy = jest.spyOn(call, 'response');

    clientStream._setResponse(null, { id: '962af482-13c2-4084-a1fe-4eb135378d67' });

    expect(spy).toBeCalledTimes(1);
    expect(spy).toBeCalledWith({
      code: GrpcStatus.OK,
      timestamp: expect.anything(),
      data: {
        id: '962af482-13c2-4084-a1fe-4eb135378d67',
      },
    });
  });
});
