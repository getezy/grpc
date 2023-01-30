/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { GrpcClient, GrpcClientFactory } from '@client';
import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcStatus, GrpcTlsType } from '@protocols';

import { generatePayload } from '../__utils__';

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

  describe('GrpcClient:Unary', () => {
    it('should throw error if service not found in package definition', async () => {
      await expect(() =>
        client.invokeUnaryRequest(
          { service: 'simple_package.v1.Test', method: 'SimpleUnaryRequest' },
          {}
        )
      ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
    });

    it('should throw error if method not found in package definition', async () => {
      await expect(() =>
        client.invokeUnaryRequest(
          { service: 'simple_package.v1.SimpleService', method: 'Test' },
          {}
        )
      ).toThrowError(`Method "Test" not found in package definition`);
    });

    it('should invoke unary request', async () => {
      const [payload] = generatePayload();

      const response = await client.invokeUnaryRequest(
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleUnaryRequest',
        },
        payload
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.OK,
        timestamp: 0,
        data: payload,
      });
    });
  });

  describe('GrpcClient:ClientStreaming', () => {
    it('should throw error if service not found in package definition', async () => {
      await expect(() =>
        client.invokeClientStreamingRequest({
          service: 'simple_package.v1.Test',
          method: 'SimpleUnaryRequest',
        })
      ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
    });

    it('should throw error if method not found in package definition', async () => {
      await expect(() =>
        client.invokeClientStreamingRequest({
          service: 'simple_package.v1.SimpleService',
          method: 'Test',
        })
      ).toThrowError(`Method "Test" not found in package definition`);
    });

    it('should invoke client streaming request', async () => {
      const [payload] = generatePayload();
      const call = client.invokeClientStreamingRequest({
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const spy = jest.spyOn(call, 'emit');

      clientStream._setResponse(null, payload);

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('response', {
        code: GrpcStatus.OK,
        timestamp: expect.anything(),
        data: payload,
      });
    });
  });

  describe('GrpcClient:ServerStreaming', () => {});

  describe('GrpcClient:BidirectionalStreaming', () => {});
});
