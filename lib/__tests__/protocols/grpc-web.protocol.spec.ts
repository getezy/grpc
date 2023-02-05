/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable no-underscore-dangle */

import { grpc as grpcWeb } from '@improbable-eng/grpc-web';
import nock from 'nock';
import * as path from 'node:path';

import { ProtobufLoader } from '@loaders';
import { GrpcTlsType, GrpcWebProtocol } from '@protocols';

import * as HttpTransport from '../../protocols/grpc-web/http.transport';
import { SimpleMessage } from '../__fixtures__/proto/generated/v3';
import {
  Certificates,
  generatePayload,
  grpcWebResponseToBuffer,
  loadCertificates,
} from '../__utils__';

describe('GrpcWebProtocol', () => {
  describe('GrpcWebProtocol:TLS', () => {
    let loader: ProtobufLoader;
    let certificates: Certificates;

    beforeEach(() => {
      jest.clearAllMocks();
    });

    beforeAll(async () => {
      loader = new ProtobufLoader(path.join(__dirname, '../__fixtures__/proto/v3.proto'));

      await loader.load();

      certificates = loadCertificates();

      const [payload] = generatePayload();

      const buffer = grpcWebResponseToBuffer([SimpleMessage.encode(payload).finish()]);

      nock('http://10.10.10.10')
        .post('/simple_package.v1.SimpleService/SimpleUnaryRequest')
        .reply(200, buffer, {
          'content-type': 'application/grpc-web+proto',
          'grpc-status': '0',
        });

      nock('https://10.10.10.10')
        .post('/simple_package.v1.SimpleService/SimpleUnaryRequest')
        .reply(200, buffer, {
          'content-type': 'application/grpc-web+proto',
          'grpc-status': '0',
        });
    });

    it('should set credentials for insecure TLS connection without protocol in url', async () => {
      const spy = jest.spyOn(grpcWeb, 'invoke');

      const protocol = new GrpcWebProtocol({
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
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'http://10.10.10.10',
        })
      );
    });

    it('should set credentials for insecure TLS connection with protocol in url', async () => {
      const spy = jest.spyOn(grpcWeb, 'invoke');

      const protocol = new GrpcWebProtocol({
        address: 'http://10.10.10.10',
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
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'http://10.10.10.10',
        })
      );
    });

    it('should set credentials for insecure TLS connection without protocol in url', async () => {
      const spy = jest.spyOn(grpcWeb, 'invoke');

      const protocol = new GrpcWebProtocol({
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
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'http://10.10.10.10',
        })
      );
    });

    it('should set credentials for server-side TLS connection without root certificate', async () => {
      const spy = jest.spyOn(grpcWeb, 'invoke');

      const protocol = new GrpcWebProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.SERVER_SIDE },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'https://10.10.10.10',
        })
      );
    });

    it('should set credentials for server-side TLS connection with root certificate', async () => {
      const invokeSpy = jest.spyOn(grpcWeb, 'invoke');
      const transportSpy = jest.spyOn(HttpTransport, 'NodeHttpTransport');

      const protocol = new GrpcWebProtocol({
        address: '10.10.10.10',
        tls: { type: GrpcTlsType.SERVER_SIDE, rootCertificatePath: certificates.rootCertPath },
      });

      await protocol.invokeUnaryRequest(
        loader.getPackageDefinition(),
        { service: 'simple_package.v1.SimpleService', method: 'SimpleUnaryRequest' },
        {}
      );

      expect(invokeSpy).toBeCalledTimes(1);
      expect(invokeSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'https://10.10.10.10',
        })
      );
      expect(transportSpy).toHaveBeenCalledWith({
        ca: certificates.rootCert,
      });
    });

    it('should set credentials for mutual TLS connection without root certificate', async () => {
      const invokeSpy = jest.spyOn(grpcWeb, 'invoke');
      const transportSpy = jest.spyOn(HttpTransport, 'NodeHttpTransport');

      const protocol = new GrpcWebProtocol({
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

      expect(invokeSpy).toBeCalledTimes(1);
      expect(invokeSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'https://10.10.10.10',
        })
      );
      expect(transportSpy).toHaveBeenCalledWith({
        cert: certificates.clientCert,
        key: certificates.clientKey,
      });
    });

    it('should set credentials for mutual TLS connection with root certificate', async () => {
      const invokeSpy = jest.spyOn(grpcWeb, 'invoke');
      const transportSpy = jest.spyOn(HttpTransport, 'NodeHttpTransport');

      const protocol = new GrpcWebProtocol({
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

      expect(invokeSpy).toBeCalledTimes(1);
      expect(invokeSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({
          host: 'https://10.10.10.10',
        })
      );
      expect(transportSpy).toHaveBeenCalledWith({
        ca: certificates.rootCert,
        cert: certificates.clientCert,
        key: certificates.clientKey,
      });
    });
  });
});
