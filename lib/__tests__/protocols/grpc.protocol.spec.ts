/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcStatus, GrpcTlsType } from '@protocols';

import { Certificates, loadCertificates } from '../__utils__';

function createSimpleService() {
  const SimpleService = jest.fn(() => ({
    SimpleUnaryRequest: jest.fn((payload, _metadata, callback) => {
      callback(null, payload);
    }),
    SimpleUnaryRequestWithError: jest.fn((payload, _metadata, callback) => {
      const error = {
        code: GrpcStatus.ABORTED,
        details: 'details',
        metadata: new grpc.Metadata(),
      };
      callback(error, payload);
    }),
    // SimpleServerStreamRequest: jest.fn(() => new ClientReadableStreamImpl(jest.fn())),
  }));

  // @ts-ignore
  SimpleService.serviceName = 'simple_package.v1.SimpleService';

  return {
    'simple_package.v1.SimpleService': SimpleService,
  };
}

describe('GrpcProtocol', () => {
  describe('GrpcProtocol:TLS', () => {
    let loader: ProtobufLoader;
    let SimpleService: any;

    let certificates: Certificates;

    beforeAll(async () => {
      SimpleService = createSimpleService();
      // @ts-ignore
      grpc.__setPackageDefinition(SimpleService);

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
      SimpleService = createSimpleService();
      // @ts-ignore
      grpc.__setPackageDefinition(SimpleService);

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

    beforeAll(async () => {
      const SimpleService = createSimpleService();
      // @ts-ignore
      grpc.__setPackageDefinition(SimpleService);

      protocol = new GrpcProtocol({ address: '10.10.10.10', tls: { type: GrpcTlsType.INSECURE } });
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();
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

    it('should invoke unary request', async () => {
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
    });

    it('should handle unary request error', async () => {
      const response = await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequestWithError' },
        {
          id: '962af482-13c2-4084-a1fe-4eb135378d67',
        }
      );

      expect(response).toStrictEqual({
        code: GrpcStatus.ABORTED,
        timestamp: 0,
        value: {
          details: 'details',
          metadata: {},
        },
      });
    });
  });
});
