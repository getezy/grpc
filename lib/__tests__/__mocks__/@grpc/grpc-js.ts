/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import type { PackageDefinition } from '@grpc/proto-loader';
import { Duplex, Readable, Writable } from 'node:stream';

import { GrpcResponse, GrpcResponseValue, GrpcStatus } from '@protocols';

const originalModule = jest.requireActual('@grpc/grpc-js');

let PACKAGE_DEFINITION_MOCK: PackageDefinition = Object.create(null);

export const __setPackageDefinition = (packageDefinition: PackageDefinition) => {
  PACKAGE_DEFINITION_MOCK = packageDefinition;
};

interface SimpleServiceMockData {
  unary?: [GrpcResponse | null, GrpcResponseValue | undefined];
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
    // @ts-ignore
    SimpleClientStream._setResponse = (
      error: GrpcResponse | null,
      data: GrpcResponseValue | undefined
    ) => {
      callback(error, data);
    };

    // @ts-ignore
    SimpleClientStream.cancel = () => {
      callback({ code: GrpcStatus.CANCELED });
    };

    return SimpleClientStream;
  });

  const SimpleServerStream = new Readable({ objectMode: true });
  SimpleServerStream._read = () => {};
  const SimpleServerStreamRequest = jest.fn((_payload, _metadata) => {
    // @ts-ignore
    SimpleServerStream._setResponse = (
      error: GrpcResponse | null,
      data: GrpcResponseValue | undefined
    ) => {
      if (error) {
        SimpleServerStream.emit('error', error);
      } else {
        SimpleServerStream.emit('data', data);
      }
    };

    // @ts-ignore
    SimpleServerStream._setEnd = () => {
      SimpleServerStream.emit('end');
    };

    // @ts-ignore
    SimpleServerStream.cancel = () => {
      SimpleServerStream.emit('cancel', { code: GrpcStatus.CANCELED });
    };

    return SimpleServerStream;
  });

  const SimpleBidirectionalStream = new Duplex({ objectMode: true });
  SimpleBidirectionalStream._write = () => {};
  SimpleBidirectionalStream._read = () => {};
  const SimpleBidirectionalStreamRequest = jest.fn(() => {
    // @ts-ignore
    SimpleBidirectionalStream._setResponse = (
      error: GrpcResponse | null,
      data: GrpcResponseValue | undefined
    ) => {
      if (error) {
        SimpleBidirectionalStream.emit('error', error);
      } else {
        SimpleBidirectionalStream.emit('data', data);
      }
    };

    // @ts-ignore
    SimpleBidirectionalStream._setEnd = () => {
      SimpleBidirectionalStream.emit('end');
    };

    // @ts-ignore
    SimpleBidirectionalStream.cancel = () => {
      SimpleBidirectionalStream.emit('cancel', { code: GrpcStatus.CANCELED });
    };

    return SimpleBidirectionalStream;
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
    SimpleServerStream,
    SimpleBidirectionalStream,
  };
};

export const loadPackageDefinition = () => PACKAGE_DEFINITION_MOCK;

export const { credentials, Metadata } = originalModule;
