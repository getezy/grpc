/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { GrpcClient, GrpcClientFactory } from '@client';
import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcTlsType } from '@protocols';

describe('GrpcClient', () => {
  let client: GrpcClient;

  beforeAll(async () => {
    // @ts-ignore
    grpc.__setSimpleServicePackageDefinition();

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
  });

  describe('GrpcClient:ServerStreaming', () => {
    it('should throw error if service not found in package definition', async () => {
      await expect(() =>
        client.invokeServerStreamingRequest(
          {
            service: 'simple_package.v1.Test',
            method: 'SimpleUnaryRequest',
          },
          {}
        )
      ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
    });

    it('should throw error if method not found in package definition', async () => {
      await expect(() =>
        client.invokeServerStreamingRequest(
          {
            service: 'simple_package.v1.SimpleService',
            method: 'Test',
          },
          {}
        )
      ).toThrowError(`Method "Test" not found in package definition`);
    });
  });

  describe('GrpcClient:BidirectionalStreaming', () => {
    it('should throw error if service not found in package definition', async () => {
      await expect(() =>
        client.invokeBidirectionalStreamingRequest(
          {
            service: 'simple_package.v1.Test',
            method: 'SimpleUnaryRequest',
          },
          {}
        )
      ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
    });

    it('should throw error if method not found in package definition', async () => {
      await expect(() =>
        client.invokeBidirectionalStreamingRequest(
          {
            service: 'simple_package.v1.SimpleService',
            method: 'Test',
          },
          {}
        )
      ).toThrowError(`Method "Test" not found in package definition`);
    });
  });
});
