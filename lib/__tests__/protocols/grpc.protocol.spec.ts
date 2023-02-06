/* eslint-disable no-underscore-dangle */

import * as grpc from '@grpc/grpc-js';
import * as path from 'node:path';

import { ProtobufLoader } from '@loaders';
import { GrpcProtocol, GrpcTlsType } from '@protocols';

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
        {}
      );

      expect(spy).toBeCalledTimes(1);
      expect(spy).toHaveBeenCalledWith();
    });

    it('should set credentials for insecure TLS connection if TLS not specified', async () => {
      const spy = jest.spyOn(grpc.credentials, 'createInsecure');

      const protocol = new GrpcProtocol({
        address: '10.10.10.10',
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
});
