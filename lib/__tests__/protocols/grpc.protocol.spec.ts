/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcStatus, GrpcTlsType } from '@protocols';

import { Certificates, generateMetadata, generatePayload, loadCertificates } from '../__utils__';

describe('GrpcProtocol', () => {
  describe('GrpcProtocol:TLS', () => {
    let loader: ProtobufLoader;
    let certificates: Certificates;

    beforeAll(async () => {
      // @ts-ignore
      grpc.__setSimpleServicePackageDefinition();

      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();

      certificates = loadCertificates();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should set credentials for insecure TLS connection', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createInsecure');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: {
          type: GrpcTlsType.INSECURE,
        },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith();
    });

    it('should set credentials for server-side TLS connection without root certificate', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createSsl');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.SERVER_SIDE },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(null);
    });

    it('should set credentials for server-side TLS connection with root certificate', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createSsl');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.SERVER_SIDE, rootCertificatePath: certificates.rootCertPath },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(certificates.rootCert);
    });

    it('should set credentials for mutual TLS connection without root certificate', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createSsl');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: {
          type: GrpcTlsType.MUTUAL,
          clientCertificatePath: certificates.clientCertPath,
          clientKeyPath: certificates.clientKeyPath,
        },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(null, certificates.clientKey, certificates.clientCert);
    });

    it('should set credentials for mutual TLS connection with root certificate', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createSsl');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: {
          type: GrpcTlsType.MUTUAL,
          rootCertificatePath: certificates.rootCertPath,
          clientCertificatePath: certificates.clientCertPath,
          clientKeyPath: certificates.clientKeyPath,
        },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        certificates.rootCert,
        certificates.clientKey,
        certificates.clientCert
      );
    });
  });

  describe('GrpcProtocol:ChannelOptions', () => {
    let protocol: GrpcProtocol;
    let loader: ProtobufLoader;
    let SimpleService: any;

    beforeAll(async () => {
      // @ts-ignore
      const { PACKAGE_DEFINITION_MOCK } = grpc.__setSimpleServicePackageDefinition();
      SimpleService = PACKAGE_DEFINITION_MOCK;

      protocol = new GrpcProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.INSECURE },
        channelOptions: { sslTargetNameOverride: 'test' },
      });
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
    });

    it('should set protocol channel options', async () => {
      const spy = jest.spyOn(SimpleService, 'simple_package.v1.SimpleService');

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledWith(
        '10.10.10.10',
        { callCredentials: {} },
        { 'grpc.ssl_target_name_override': 'test' }
      );
    });
  });

  describe('GrpcProtocol:UnaryRequest', () => {
    let protocol: GrpcProtocol;
    let loader: ProtobufLoader;
    let SimpleUnaryRequest: any;

    beforeAll(async () => {
      // @ts-ignore
      const { SimpleUnaryRequest: UnaryRequest } = grpc.__setSimpleServicePackageDefinition();
      SimpleUnaryRequest = UnaryRequest;

      protocol = new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } });
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should invoke unary request without metadata', async () => {
      const [payload] = generatePayload();
      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        payload
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.OK,
        timestamp: 0,
        data: payload,
      });

      expect(SimpleUnaryRequest).toBeCalledTimes(1);
      expect(SimpleUnaryRequest).toBeCalledWith(payload, new grpc.Metadata(), expect.anything());
    });

    it('should invoke unary request with metadata', async () => {
      const [payload] = generatePayload();
      const { pureMetadata, metadata } = generateMetadata();

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        payload,
        pureMetadata
      );

      expect(SimpleUnaryRequest).toBeCalledTimes(1);
      expect(SimpleUnaryRequest).toBeCalledWith(payload, metadata, expect.anything());
    });

    it('should handle unary request error without error code', async () => {
      // @ts-ignore
      grpc.__setSimpleServicePackageDefinition({
        unary: [
          {
            details: 'details',
          },
        ],
      });

      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
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
    });

    it('should handle unary request error with error code', async () => {
      // @ts-ignore
      grpc.__setSimpleServicePackageDefinition({
        unary: [
          {
            code: GrpcStatus.ABORTED,
            details: 'details',
          },
        ],
      });

      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
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
    });
  });

  describe('GrpcProtocol:ClientStreamingRequest', () => {
    let protocol: GrpcProtocol;
    let loader: ProtobufLoader;

    let SimpleClientStreamMethod: any;
    let stream: any;

    beforeAll(async () => {
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
    });

    beforeEach(() => {
      const { SimpleClientStreamRequest, SimpleClientStream } =
        // @ts-ignore
        grpc.__setSimpleServicePackageDefinition();
      SimpleClientStreamMethod = SimpleClientStreamRequest;
      stream = SimpleClientStream;

      protocol = new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should invoke client streaming request without metadata', async () => {
      const payload = generatePayload(3);

      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const writeSpy = jest.spyOn(stream, 'write');

      call.write(payload[0]);
      call.write(payload[1]);

      expect(writeSpy).toBeCalledTimes(2);
      expect(writeSpy).toHaveBeenNthCalledWith(1, payload[0]);
      expect(writeSpy).toHaveBeenNthCalledWith(2, payload[1]);

      const endSpy = jest.spyOn(stream, 'end');
      call.end();

      expect(endSpy).toBeCalledTimes(1);

      const emitSpy = jest.spyOn(call, 'emit');

      stream._setResponse(null, payload[3]);

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith('response', {
        code: GrpcStatus.OK,
        timestamp: expect.anything(),
        data: payload[3],
      });

      expect(SimpleClientStreamMethod).toBeCalledTimes(1);
      expect(SimpleClientStreamMethod).toBeCalledWith(new grpc.Metadata(), expect.anything());
    });

    it('should invoke client streaming request with metadata', async () => {
      const { pureMetadata, metadata } = generateMetadata();

      protocol.invokeClientStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleClientStreamRequest',
        },
        pureMetadata
      );

      expect(SimpleClientStreamMethod).toBeCalledTimes(1);
      expect(SimpleClientStreamMethod).toBeCalledWith(metadata, expect.anything());
    });

    it('should cancel client streaming request', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const emitSpy = jest.spyOn(call, 'emit');
      const cancelSpy = jest.spyOn(stream, 'cancel');

      expect(() => call.cancel()).toThrow();

      expect(cancelSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledTimes(2);
      expect(emitSpy).toHaveBeenNthCalledWith(2, 'error', {
        code: GrpcStatus.CANCELED,
        data: expect.anything(),
        timestamp: expect.anything(),
      });
    });

    it('should handle client streaming request error without error code', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const emitSpy = jest.spyOn(call, 'emit');

      expect(() => stream._setResponse({ details: 'details' })).toThrow();

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith('error', {
        code: GrpcStatus.UNKNOWN,
        timestamp: expect.anything(),
        data: {
          details: 'details',
          metadata: undefined,
        },
      });
    });

    it('should handle client streaming request error with error code', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const emitSpy = jest.spyOn(call, 'emit');

      expect(() => stream._setResponse({ code: GrpcStatus.ABORTED, details: 'details' })).toThrow();

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith('error', {
        code: GrpcStatus.ABORTED,
        timestamp: expect.anything(),
        data: {
          details: 'details',
          metadata: undefined,
        },
      });
    });
  });

  describe('GrpcProtocol:ServerStreamingRequest', () => {
    let protocol: GrpcProtocol;
    let loader: ProtobufLoader;

    let SimpleServerStreamMethod: any;
    let stream: any;

    beforeAll(async () => {
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
    });

    beforeEach(() => {
      const { SimpleServerStreamRequest, SimpleServerStream } =
        // @ts-ignore
        grpc.__setSimpleServicePackageDefinition();
      SimpleServerStreamMethod = SimpleServerStreamRequest;
      stream = SimpleServerStream;

      protocol = new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } });
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should invoke server streaming request without metadata', () => {
      const payload = generatePayload(3);

      const call = protocol.invokeServerStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleServerStreamRequest',
        },
        payload[0]
      );

      const emitSpy = jest.spyOn(call, 'emit');

      stream._setResponse(null, payload[1]);
      stream._setResponse(null, payload[2]);
      stream._setEnd();

      expect(emitSpy).toBeCalledTimes(3);
      expect(emitSpy).toHaveBeenNthCalledWith(1, 'response', payload[1]);
      expect(emitSpy).toHaveBeenNthCalledWith(2, 'response', payload[2]);
      expect(emitSpy).toHaveBeenNthCalledWith(3, 'end');

      expect(SimpleServerStreamMethod).toBeCalledTimes(1);
      expect(SimpleServerStreamMethod).toBeCalledWith(payload[0], new grpc.Metadata());
    });

    it('should invoke server streaming request with metadata', () => {
      const [payload] = generatePayload();
      const { pureMetadata, metadata } = generateMetadata();

      protocol.invokeServerStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleServerStreamRequest',
        },
        payload,
        pureMetadata
      );

      expect(SimpleServerStreamMethod).toBeCalledTimes(1);
      expect(SimpleServerStreamMethod).toBeCalledWith(payload, metadata);
    });

    it('should cancel server streaming request without metadata', () => {
      const [payload] = generatePayload();

      const call = protocol.invokeServerStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleServerStreamRequest',
        },
        payload
      );

      const cancelSpy = jest.spyOn(stream, 'cancel');
      const emitSpy = jest.spyOn(call, 'emit');

      call.cancel();

      expect(cancelSpy).toBeCalledTimes(1);
      expect(emitSpy).toHaveBeenNthCalledWith(1, 'cancel');
    });

    it('should handle server streaming request error without error code', () => {
      const [payload] = generatePayload();

      const call = protocol.invokeServerStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleServerStreamRequest',
        },
        payload
      );

      const emitSpy = jest.spyOn(call, 'emit');

      expect(() => stream._setResponse({ details: 'details' })).toThrow();

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith('error', {
        code: GrpcStatus.UNKNOWN,
        timestamp: expect.anything(),
        data: {
          details: 'details',
          metadata: undefined,
        },
      });
    });

    it('should handle server streaming request error with error code', () => {
      const [payload] = generatePayload();

      const call = protocol.invokeServerStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleServerStreamRequest',
        },
        payload
      );

      const emitSpy = jest.spyOn(call, 'emit');

      expect(() => stream._setResponse({ code: GrpcStatus.ABORTED, details: 'details' })).toThrow();

      expect(emitSpy).toBeCalledTimes(1);
      expect(emitSpy).toBeCalledWith('error', {
        code: GrpcStatus.ABORTED,
        timestamp: expect.anything(),
        data: {
          details: 'details',
          metadata: undefined,
        },
      });
    });
  });
});
