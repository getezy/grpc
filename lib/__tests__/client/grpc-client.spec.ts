/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */

// import { grpcResponseToBuffer } from '@cloudnc/grpc-web-testing-toolbox/base';
import * as grpc from '@grpc/grpc-js';
import { grpc as grpcWeb } from '@improbable-eng/grpc-web';
import nock from 'nock';

import { GrpcStatus } from '@protocols';

import { SimpleMessage } from '../__fixtures__/proto/generated/v3';
import {
  createGrpcClient,
  createGrpcWebClient,
  generateMetadata,
  generatePayload,
  grpcWebResponseToBuffer,
  LoaderType,
  MetadataType,
  ProtocolType,
} from '../__utils__';

const GRPC_CLIENT_PROTOBUF = {
  type: '(ProtobufLoader, GrpcProtocol)',
  loaderType: LoaderType.Protobuf,
  protocolType: ProtocolType.Grpc,
  metadataType: MetadataType.Grpc,
};

const GRPC_WEB_CLIENT_PROTOBUF = {
  type: '(ProtobufLoader, GrpcWebProtocol)',
  loaderType: LoaderType.Protobuf,
  protocolType: ProtocolType.GrpcWeb,
  metadataType: MetadataType.GrpcWeb,
};

const ALL_GRPC_CLIENTS = [GRPC_CLIENT_PROTOBUF];
const ALL_GRPC_WEB_CLIENTS = [GRPC_WEB_CLIENT_PROTOBUF];

describe('GrpcClient', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GrpcClient:GrpcProtocol', () => {
    describe('GrpcClient:GrpcProtocol:Unary', () => {
      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeUnaryRequest(
              { service: 'simple_package.v1.Test', method: 'SimpleUnaryRequest' },
              {}
            )
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if method not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeUnaryRequest(
              { service: 'simple_package.v1.SimpleService', method: 'Test' },
              {}
            )
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke unary request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleUnaryRequest } = await createGrpcClient(loaderType, protocolType);

          const [payload] = generatePayload();
          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            payload
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload,
          });

          expect(SimpleUnaryRequest).toBeCalledTimes(1);
          expect(SimpleUnaryRequest).toBeCalledWith(
            payload,
            new grpc.Metadata(),
            expect.anything()
          );
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke unary request with metadata',
        async ({ loaderType, protocolType, metadataType }) => {
          const { client, SimpleUnaryRequest } = await createGrpcClient(loaderType, protocolType);

          const [payload] = generatePayload();
          const { pureMetadata, metadata } = generateMetadata(metadataType);

          await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            payload,
            pureMetadata
          );

          expect(SimpleUnaryRequest).toBeCalledTimes(1);
          expect(SimpleUnaryRequest).toBeCalledWith(payload, metadata, expect.anything());
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle unary request error without error code',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          // @ts-ignore
          grpc.__setSimpleServicePackageDefinition({
            unary: [
              {
                details: 'details',
              },
            ],
          });

          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            {}
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.UNKNOWN,
            timestamp: 0,
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle unary request error with error code',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          // @ts-ignore
          grpc.__setSimpleServicePackageDefinition({
            unary: [
              {
                code: GrpcStatus.ABORTED,
                details: 'details',
              },
            ],
          });

          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            {}
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.ABORTED,
            timestamp: 0,
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );
    });

    describe('GrpcClient:GrpcProtocol:ClientStreaming', () => {
      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeClientStreamingRequest({
              service: 'simple_package.v1.Test',
              method: 'SimpleClientStreamingRequest',
            })
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if method not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeClientStreamingRequest({
              service: 'simple_package.v1.SimpleService',
              method: 'Test',
            })
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke client streaming request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleClientStream, SimpleClientStreamRequest } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const payload = generatePayload(3);

          const call = client.invokeClientStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleClientStreamRequest',
          });

          const writeSpy = jest.spyOn(SimpleClientStream, 'write');

          call.write(payload[0]);
          call.write(payload[1]);

          expect(writeSpy).toBeCalledTimes(2);
          expect(writeSpy).toHaveBeenNthCalledWith(1, payload[0]);
          expect(writeSpy).toHaveBeenNthCalledWith(2, payload[1]);

          const endSpy = jest.spyOn(SimpleClientStream, 'end');
          call.end();

          expect(endSpy).toBeCalledTimes(1);

          const emitSpy = jest.spyOn(call, 'emit');

          SimpleClientStream._setResponse(null, payload[3]);

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('response', {
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload[3],
          });

          expect(SimpleClientStreamRequest).toBeCalledTimes(1);
          expect(SimpleClientStreamRequest).toBeCalledWith(new grpc.Metadata(), expect.anything());
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke client streaming request with metadata',
        async ({ loaderType, protocolType, metadataType }) => {
          const { client, SimpleClientStreamRequest } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const { pureMetadata, metadata } = generateMetadata(metadataType);

          client.invokeClientStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleClientStreamRequest',
            },
            pureMetadata
          );

          expect(SimpleClientStreamRequest).toBeCalledTimes(1);
          expect(SimpleClientStreamRequest).toBeCalledWith(metadata, expect.anything());
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should cancel client streaming request',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleClientStream } = await createGrpcClient(loaderType, protocolType);

          const call = client.invokeClientStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleClientStreamRequest',
          });

          const emitSpy = jest.spyOn(call, 'emit');
          const cancelSpy = jest.spyOn(SimpleClientStream, 'cancel');

          expect(() => call.cancel()).toThrow();

          expect(cancelSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledTimes(2);
          expect(emitSpy).toHaveBeenNthCalledWith(2, 'error', {
            code: GrpcStatus.CANCELED,
            data: expect.anything(),
            timestamp: expect.anything(),
          });
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle client streaming request error without error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleClientStream } = await createGrpcClient(loaderType, protocolType);

          const call = client.invokeClientStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleClientStreamRequest',
          });

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() => SimpleClientStream._setResponse({ details: 'details' })).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.UNKNOWN,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle client streaming request error with error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleClientStream } = await createGrpcClient(loaderType, protocolType);

          const call = client.invokeClientStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleClientStreamRequest',
          });

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() =>
            SimpleClientStream._setResponse({ code: GrpcStatus.ABORTED, details: 'details' })
          ).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.ABORTED,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );
    });

    describe('GrpcClient:GrpcProtocol:ServerStreaming', () => {
      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeServerStreamingRequest(
              {
                service: 'simple_package.v1.Test',
                method: 'SimpleServerStreamingRequest',
              },
              {}
            )
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeServerStreamingRequest(
              {
                service: 'simple_package.v1.SimpleService',
                method: 'Test',
              },
              {}
            )
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke server streaming request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleServerStream, SimpleServerStreamRequest } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const payload = generatePayload(3);

          const call = client.invokeServerStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleServerStreamRequest',
            },
            payload[0]
          );

          const emitSpy = jest.spyOn(call, 'emit');

          SimpleServerStream._setResponse(null, payload[1]);
          SimpleServerStream._setResponse(null, payload[2]);
          SimpleServerStream._setEnd();

          expect(emitSpy).toBeCalledTimes(3);
          expect(emitSpy).toHaveBeenNthCalledWith(1, 'response', {
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload[1],
          });
          expect(emitSpy).toHaveBeenNthCalledWith(2, 'response', {
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload[2],
          });
          expect(emitSpy).toHaveBeenNthCalledWith(3, 'end');

          expect(SimpleServerStreamRequest).toBeCalledTimes(1);
          expect(SimpleServerStreamRequest).toBeCalledWith(payload[0], new grpc.Metadata());
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke server streaming request with metadata',
        async ({ loaderType, protocolType, metadataType }) => {
          const { client, SimpleServerStreamRequest } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const [payload] = generatePayload();
          const { pureMetadata, metadata } = generateMetadata(metadataType);

          client.invokeServerStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleServerStreamRequest',
            },
            payload,
            pureMetadata
          );

          expect(SimpleServerStreamRequest).toBeCalledTimes(1);
          expect(SimpleServerStreamRequest).toBeCalledWith(payload, metadata);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should cancel server streaming request',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleServerStream } = await createGrpcClient(loaderType, protocolType);

          const [payload] = generatePayload();

          const call = client.invokeServerStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleServerStreamRequest',
            },
            payload
          );

          const cancelSpy = jest.spyOn(SimpleServerStream, 'cancel');
          const emitSpy = jest.spyOn(call, 'emit');

          call.cancel();

          expect(cancelSpy).toBeCalledTimes(1);
          expect(emitSpy).toHaveBeenNthCalledWith(1, 'cancel');
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle server streaming request error without error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleServerStream } = await createGrpcClient(loaderType, protocolType);

          const [payload] = generatePayload();

          const call = client.invokeServerStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleServerStreamRequest',
            },
            payload
          );

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() => SimpleServerStream._setResponse({ details: 'details' })).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.UNKNOWN,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle server streaming request error with error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleServerStream } = await createGrpcClient(loaderType, protocolType);

          const [payload] = generatePayload();

          const call = client.invokeServerStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleServerStreamRequest',
            },
            payload
          );

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() =>
            SimpleServerStream._setResponse({ code: GrpcStatus.ABORTED, details: 'details' })
          ).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.ABORTED,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );
    });

    describe('GrpcClient:GrpcProtocol:BidirectionalStreaming', () => {
      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeBidirectionalStreamingRequest(
              {
                service: 'simple_package.v1.Test',
                method: 'SimpleBidirectionalRequest',
              },
              {}
            )
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeBidirectionalStreamingRequest(
              {
                service: 'simple_package.v1.SimpleService',
                method: 'Test',
              },
              {}
            )
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke bidirectional streaming request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleBidirectionalStream, SimpleBidirectionalStreamRequest } =
            await createGrpcClient(loaderType, protocolType);

          const payload = generatePayload(4);

          const call = client.invokeBidirectionalStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleBidirectionalStreamRequest',
          });

          const writeSpy = jest.spyOn(SimpleBidirectionalStream, 'write');

          call.write(payload[0]);
          call.write(payload[1]);

          expect(writeSpy).toBeCalledTimes(2);
          expect(writeSpy).toHaveBeenNthCalledWith(1, payload[0]);
          expect(writeSpy).toHaveBeenNthCalledWith(2, payload[1]);

          const endSpy = jest.spyOn(SimpleBidirectionalStream, 'end');
          call.end();

          expect(endSpy).toBeCalledTimes(1);

          const emitSpy = jest.spyOn(call, 'emit');

          SimpleBidirectionalStream._setResponse(null, payload[2]);
          SimpleBidirectionalStream._setResponse(null, payload[3]);
          SimpleBidirectionalStream._setEnd();

          expect(emitSpy).toBeCalledTimes(3);
          expect(emitSpy).toHaveBeenNthCalledWith(1, 'response', {
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload[2],
          });
          expect(emitSpy).toHaveBeenNthCalledWith(2, 'response', {
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload[3],
          });
          expect(emitSpy).toHaveBeenNthCalledWith(3, 'end-server-stream');

          expect(SimpleBidirectionalStreamRequest).toBeCalledTimes(1);
          expect(SimpleBidirectionalStreamRequest).toBeCalledWith(new grpc.Metadata());
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should invoke bidirectional streaming request with metadata',
        async ({ loaderType, protocolType, metadataType }) => {
          const { client, SimpleBidirectionalStreamRequest } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const { pureMetadata, metadata } = generateMetadata(metadataType);

          client.invokeBidirectionalStreamingRequest(
            {
              service: 'simple_package.v1.SimpleService',
              method: 'SimpleBidirectionalStreamRequest',
            },
            pureMetadata
          );

          expect(SimpleBidirectionalStreamRequest).toBeCalledTimes(1);
          expect(SimpleBidirectionalStreamRequest).toBeCalledWith(metadata);
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should cancel bidirectional streaming request',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleBidirectionalStream } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const call = client.invokeBidirectionalStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleBidirectionalStreamRequest',
          });

          const cancelSpy = jest.spyOn(SimpleBidirectionalStream, 'cancel');
          const emitSpy = jest.spyOn(call, 'emit');

          call.cancel();

          expect(cancelSpy).toBeCalledTimes(1);
          expect(emitSpy).toHaveBeenNthCalledWith(1, 'cancel');
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle bidirectional streaming request error without error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleBidirectionalStream } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const call = client.invokeBidirectionalStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleBidirectionalStreamRequest',
          });

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() => SimpleBidirectionalStream._setResponse({ details: 'details' })).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.UNKNOWN,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );

      it.each(ALL_GRPC_CLIENTS)(
        '$type: should handle bidirectional streaming request error with error code',
        async ({ loaderType, protocolType }) => {
          const { client, SimpleBidirectionalStream } = await createGrpcClient(
            loaderType,
            protocolType
          );

          const call = client.invokeBidirectionalStreamingRequest({
            service: 'simple_package.v1.SimpleService',
            method: 'SimpleBidirectionalStreamRequest',
          });

          const emitSpy = jest.spyOn(call, 'emit');

          expect(() =>
            SimpleBidirectionalStream._setResponse({ code: GrpcStatus.ABORTED, details: 'details' })
          ).toThrow();

          expect(emitSpy).toBeCalledTimes(1);
          expect(emitSpy).toBeCalledWith('error', {
            code: GrpcStatus.ABORTED,
            timestamp: expect.anything(),
            data: {
              details: 'details',
              metadata: undefined,
            },
          });
        }
      );
    });
  });

  describe('GrpcClient:GrpcWebProtocol', () => {
    beforeEach(() => {
      nock.cleanAll();
    });

    describe('GrpcClient:GrpcWebProtocol:Unary', () => {
      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          await expect(() =>
            client.invokeUnaryRequest(
              { service: 'simple_package.v1.Test', method: 'SimpleUnaryRequest' },
              {}
            )
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should throw error if method not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          await expect(() =>
            client.invokeUnaryRequest(
              { service: 'simple_package.v1.SimpleService', method: 'Test' },
              {}
            )
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should invoke unary request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const [payload] = generatePayload();

          const buffer = grpcWebResponseToBuffer([SimpleMessage.encode(payload).finish()]);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleUnaryRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '0',
            });

          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            payload
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload,
          });

          expect(grpcWeb.invoke).toBeCalledTimes(1);
          expect(grpcWeb.invoke).toBeCalledWith(
            expect.anything(),
            expect.objectContaining({
              metadata: new grpcWeb.Metadata(),
            })
          );
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should invoke unary request with metadata',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const [payload] = generatePayload();
          const { pureMetadata, metadata } = generateMetadata(MetadataType.GrpcWeb);

          const buffer = grpcWebResponseToBuffer([SimpleMessage.encode(payload).finish()]);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleUnaryRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '0',
            });

          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            payload,
            pureMetadata
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.OK,
            timestamp: expect.anything(),
            data: payload,
          });

          expect(grpcWeb.invoke).toBeCalledTimes(1);
          expect(grpcWeb.invoke).toBeCalledWith(
            expect.anything(),
            expect.objectContaining({
              metadata,
            })
          );
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should handle unary request error',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleUnaryRequest')
            .once()
            .reply(200, undefined, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '10',
            });

          const response = await client.invokeUnaryRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
            {}
          );

          expect(response).toStrictEqual({
            code: GrpcStatus.ABORTED,
            timestamp: expect.anything(),
            data: expect.anything(),
          });
        }
      );
    });

    describe('GrpcClient:GrpcWebProtocol:ClientStreaming', () => {
      it.each(ALL_GRPC_WEB_CLIENTS)(
        `$type: should throw error that protocol doesn't support client streaming requests`,
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcClient(loaderType, protocolType);

          await expect(() =>
            client.invokeClientStreamingRequest({
              service: 'simple_package.v1.Test',
              method: 'SimpleClientStreamingRequest',
            })
          ).toThrowError(`gRPC-Web doesn't support client streaming requests.`);
        }
      );
    });

    describe('GrpcClient:GrpcWebProtocol:ServerStreaming', () => {
      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should throw error if service not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);
          await expect(() =>
            client.invokeServerStreamingRequest(
              { service: 'simple_package.v1.Test', method: 'SimpleServerStreamingRequest' },
              {}
            )
          ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should throw error if method not found in package definition',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);
          await expect(() =>
            client.invokeServerStreamingRequest(
              { service: 'simple_package.v1.SimpleService', method: 'Test' },
              {}
            )
          ).toThrowError(`Method "Test" not found in package definition`);
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should invoke server streaming request with metadata',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const payload = generatePayload(3);
          const { pureMetadata, metadata } = generateMetadata(MetadataType.GrpcWeb);

          const buffer = grpcWebResponseToBuffer([
            SimpleMessage.encode(payload[0]).finish(),
            SimpleMessage.encode(payload[1]).finish(),
          ]);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleServerStreamRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '0',
            });

          const call = client.invokeServerStreamingRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleServerStreamRequest' },
            payload[2],
            pureMetadata
          );

          const emitSpy = jest.spyOn(call, 'emit');

          expect(grpcWeb.invoke).toBeCalledTimes(1);
          expect(grpcWeb.invoke).toBeCalledWith(
            expect.anything(),
            expect.objectContaining({
              metadata,
            })
          );

          const response: any[] = [];
          return new Promise((resolve) => {
            call.on('response', (message) => {
              response.push(message);
            });

            call.on('end', () => resolve(true));
          }).then(() => {
            expect(emitSpy).toBeCalledTimes(3);
            expect(response).toStrictEqual([
              { code: GrpcStatus.OK, timestamp: expect.anything(), data: payload[0] },
              { code: GrpcStatus.OK, timestamp: expect.anything(), data: payload[1] },
            ]);
          });
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should invoke server streaming request without metadata',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const payload = generatePayload(2);

          const buffer = grpcWebResponseToBuffer([SimpleMessage.encode(payload[0]).finish()]);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleServerStreamRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '0',
            });

          client.invokeServerStreamingRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleServerStreamRequest' },
            payload[1]
          );

          expect(grpcWeb.invoke).toBeCalledTimes(1);
          expect(grpcWeb.invoke).toBeCalledWith(
            expect.anything(),
            expect.objectContaining({
              metadata: new grpcWeb.Metadata(),
            })
          );
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should cancel server streaming request',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const payload = generatePayload(2);

          const buffer = grpcWebResponseToBuffer([SimpleMessage.encode(payload[0]).finish()]);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleServerStreamRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
              'grpc-status': '0',
            });

          const call = client.invokeServerStreamingRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleServerStreamRequest' },
            payload[1]
          );

          const emitSpy = jest.spyOn(call, 'emit');
          call.cancel();

          expect(emitSpy).toHaveBeenNthCalledWith(1, 'cancel');

          expect(grpcWeb.invoke).toBeCalledTimes(1);
          expect(grpcWeb.invoke).toBeCalledWith(
            expect.anything(),
            expect.objectContaining({
              metadata: new grpcWeb.Metadata(),
            })
          );
        }
      );

      it.each(ALL_GRPC_WEB_CLIENTS)(
        '$type: should handle server streaming request error with error code',
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          const [payload] = generatePayload(1);

          const buffer = grpcWebResponseToBuffer([], GrpcStatus.ABORTED);

          nock('http://10.10.10.10')
            .post('/simple_package.v1.SimpleService/SimpleServerStreamRequest')
            .once()
            .reply(200, buffer, {
              'content-type': 'application/grpc-web+proto',
            });

          const call = client.invokeServerStreamingRequest(
            { service: 'simple_package.v1.SimpleService', method: 'SimpleServerStreamRequest' },
            payload
          );

          const emitSpy = jest.spyOn(call, 'emit');

          let error: any;
          return new Promise((resolve) => {
            call.on('error', (message) => {
              error = message;
              return resolve(true);
            });
          }).then(() => {
            expect(emitSpy).toBeCalledTimes(1);
            expect(error).toStrictEqual({
              code: GrpcStatus.ABORTED,
              timestamp: expect.anything(),
              data: {
                details: GrpcStatus.ABORTED.toString(),
                metadata: {
                  'grpc-status': [GrpcStatus.ABORTED.toString()],
                  'grpc-message': [GrpcStatus.ABORTED.toString()],
                },
              },
            });
          });
        }
      );
    });

    describe('GrpcClient:GrpcWebProtocol:BidirectionalStreaming', () => {
      it.each(ALL_GRPC_WEB_CLIENTS)(
        `$type: should throw error that protocol doesn't support bidirectional streaming requests`,
        async ({ loaderType, protocolType }) => {
          const { client } = await createGrpcWebClient(loaderType, protocolType);

          await expect(() =>
            client.invokeBidirectionalStreamingRequest({
              service: 'simple_package.v1.Test',
              method: 'SimpleBidirectionalRequest',
            })
          ).toThrowError(`gRPC-Web doesn't support bidirectional streaming requests.`);
        }
      );
    });
  });
});
