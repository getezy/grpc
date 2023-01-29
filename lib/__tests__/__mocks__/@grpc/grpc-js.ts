/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import type { PackageDefinition } from '@grpc/proto-loader';
import { Duplex, Readable, Writable } from 'node:stream';

import { GrpcResponse, GrpcStatus } from '@protocols';

const originalModule = jest.requireActual('@grpc/grpc-js');

let PACKAGE_DEFINITION_MOCK: PackageDefinition = Object.create(null);

export const __setPackageDefinition = (packageDefinition: PackageDefinition) => {
  PACKAGE_DEFINITION_MOCK = packageDefinition;
};

interface SimpleServiceMockData {
  unary?: [GrpcResponse | null, GrpcResponse | undefined];
}

export const __setSimpleServicePackageDefinition = ({ unary }: SimpleServiceMockData = {}) => {
  const SimpleUnaryRequest = jest.fn((payload, _metadata, callback) => {
    if (unary) {
      callback(...unary);
    } else {
      callback(null, payload);
    }
  });

  const SimpleClientStream = new Writable({ objectMode: true });
  SimpleClientStream._write = () => {};
  const SimpleClientStreamRequest = jest.fn((_metadata, callback) => {
    // const stream = new Writable();

    // @ts-ignore
    SimpleClientStream._setResponse = (
      error: GrpcResponse | null,
      data: GrpcResponse | undefined
    ) => {
      callback(error, data);
    };

    // @ts-ignore
    SimpleClientStream.cancel = () => {
      callback({ code: GrpcStatus.CANCELED });
    };

    return SimpleClientStream;
  });

  const SimpleServerStreamRequest = jest.fn(() => {
    const stream = new Readable();
    return stream;
  });

  const SimpleBidirectionalStreamRequest = jest.fn(() => {
    const stream = new Duplex();
    return stream;
  });

  const SimpleService = jest.fn(() => ({
    SimpleUnaryRequest,
    SimpleClientStreamRequest,
    SimpleServerStreamRequest,
    SimpleBidirectionalStreamRequest,
  }));

  // @ts-ignore
  SimpleService.serviceName = 'simple_package.v1.SimpleService';

  PACKAGE_DEFINITION_MOCK = {
    // @ts-ignore
    'simple_package.v1.SimpleService': SimpleService,
  };

  return {
    PACKAGE_DEFINITION_MOCK,
    SimpleUnaryRequest,
    SimpleClientStreamRequest,
    SimpleServerStreamRequest,
    SimpleBidirectionalStreamRequest,
    SimpleClientStream,
  };
};

export const loadPackageDefinition = () => PACKAGE_DEFINITION_MOCK;

export const { credentials, Metadata } = originalModule;
