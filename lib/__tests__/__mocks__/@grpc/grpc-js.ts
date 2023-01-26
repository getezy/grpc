/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import type { PackageDefinition } from '@grpc/proto-loader';

import { GrpcResponse } from '@protocols';

const originalModule = jest.requireActual('@grpc/grpc-js');

let PACKAGE_DEFINITION_MOCK: PackageDefinition = Object.create(null);

export const __setPackageDefinition = (packageDefinition: PackageDefinition) => {
  PACKAGE_DEFINITION_MOCK = packageDefinition;
};

interface SimpleServiceMockData {
  simpleUnaryRequest?: [GrpcResponse | null, GrpcResponse | undefined];
}

export const __setSimpleServicePackageDefinition = ({
  simpleUnaryRequest,
}: SimpleServiceMockData = {}) => {
  const SimpleUnaryRequest = jest.fn((payload, _metadata, callback) => {
    if (simpleUnaryRequest) {
      callback(...simpleUnaryRequest);
    } else {
      callback(null, payload);
    }
  });

  const SimpleService = jest.fn(() => ({
    SimpleUnaryRequest,
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
  };
};

export const loadPackageDefinition = () => PACKAGE_DEFINITION_MOCK;

export const { credentials, Metadata } = originalModule;
