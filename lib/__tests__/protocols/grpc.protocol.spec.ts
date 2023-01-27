/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcStatus, GrpcTlsType } from '@protocols';

import { Certificates, loadCertificates } from '../__utils__';

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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
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

    it('should throw error if service not found in package definition', async () => {
      await expect(() =>
        protocol.invokeUnaryRequest(
          loader.getPackageDefinition(),
          { service: 'simple_package.v1.Test', method: 'SimpleUnaryRequest' },
          {}
        )
      ).toThrowError(`Service "simple_package.v1.Test" not found in package definition`);
    });

    it('should throw error if method not found in package definition', async () => {
      await expect(() =>
        protocol.invokeUnaryRequest(
          loader.getPackageDefinition(),
          { service: 'simple_package.v1.SimpleService', method: 'Test' },
          {}
        )
      ).toThrowError(`Method "Test" not found in package definition`);
    });

    it('should invoke unary request without metadata', async () => {
      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.OK,
        timestamp: 0,
        value: {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        },
      });

      expect(SimpleUnaryRequest).toBeCalledTimes(1);
      expect(SimpleUnaryRequest).toBeCalledWith(
        { id: '962af482-13c2-4084-a1fe-4eb135378d67' },
        new grpc.Metadata(),
        expect.anything()
      );
    });

    it('should invoke unary request with metadata', async () => {
      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        },
        {
          'x-access-token': 'token',
        }
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.OK,
        timestamp: 0,
        value: {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        },
      });

      expect(SimpleUnaryRequest).toBeCalledTimes(1);

      const metadata = new grpc.Metadata();
      metadata.set('x-access-token', 'token');

      expect(SimpleUnaryRequest).toBeCalledWith(
        { id: '962af482-13c2-4084-a1fe-4eb135378d67' },
        metadata,
        expect.anything()
      );
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.UNKNOWN,
        timestamp: 0,
        value: {
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
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.ABORTED,
        timestamp: 0,
        value: {
          details: 'details',
          metadata: undefined,
        },
      });
    });
  });

  describe('GrpcProtocol:ClientStreamingRequest', () => {
    let protocol: GrpcProtocol;
    let loader: ProtobufLoader;
    let SimpleClientStreamRequest: any;

    beforeAll(async () => {
      const { SimpleClientStreamRequest: ClientStreamRequest } =
        // @ts-ignore
        grpc.__setSimpleServicePackageDefinition();
      SimpleClientStreamRequest = ClientStreamRequest;

      protocol = new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } });
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should invoke client streaming request without metadata', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const spy = jest.spyOn(call, 'emit');

      // @ts-ignore
      call._push(null, { id: '962af482-13c2-4084-a1fe-4eb135378d67' });

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('data', { id: '962af482-13c2-4084-a1fe-4eb135378d67' });

      expect(SimpleClientStreamRequest).toBeCalledTimes(1);
      expect(SimpleClientStreamRequest).toBeCalledWith(new grpc.Metadata(), expect.anything());
    });

    it('should invoke client streaming request with metadata', async () => {
      const call = protocol.invokeClientStreamingRequest(
        loader.getPackageDefinition(),
        {
          service: 'simple_package.v1.SimpleService',
          method: 'SimpleClientStreamRequest',
        },
        {
          'x-access-token': 'token',
        }
      );

      const spy = jest.spyOn(call, 'emit');

      // @ts-ignore
      call._push(null, { id: '962af482-13c2-4084-a1fe-4eb135378d67' });

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('data', { id: '962af482-13c2-4084-a1fe-4eb135378d67' });

      const metadata = new grpc.Metadata();
      metadata.set('x-access-token', 'token');

      expect(SimpleClientStreamRequest).toBeCalledTimes(1);
      expect(SimpleClientStreamRequest).toBeCalledWith(metadata, expect.anything());
    });

    it('should handle unary request error without error code', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const spy = jest.spyOn(call, 'emit');

      try {
        // @ts-ignore
        call._push({ details: 'details' });
      } catch {
        /* empty */
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('error', {
        code: GrpcStatus.UNKNOWN,
        value: {
          details: 'details',
          metadata: undefined,
        },
      });

      expect(SimpleClientStreamRequest).toBeCalledTimes(1);
      expect(SimpleClientStreamRequest).toBeCalledWith(new grpc.Metadata(), expect.anything());
    });

    it('should handle unary request error with error code', async () => {
      const call = protocol.invokeClientStreamingRequest(loader.getPackageDefinition(), {
        service: 'simple_package.v1.SimpleService',
        method: 'SimpleClientStreamRequest',
      });

      const spy = jest.spyOn(call, 'emit');

      try {
        // @ts-ignore
        call._push({ code: GrpcStatus.ABORTED, details: 'details' });
      } catch {
        /* empty */
      }

      expect(spy).toBeCalledTimes(1);
      expect(spy).toBeCalledWith('error', {
        code: GrpcStatus.ABORTED,
        value: {
          details: 'details',
          metadata: undefined,
        },
      });

      expect(SimpleClientStreamRequest).toBeCalledTimes(1);
      expect(SimpleClientStreamRequest).toBeCalledWith(new grpc.Metadata(), expect.anything());
    });
  });
});
