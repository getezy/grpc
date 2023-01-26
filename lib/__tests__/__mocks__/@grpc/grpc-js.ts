/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */

import type { PackageDefinition } from '@grpc/proto-loader';

const originalModule = jest.requireActual('@grpc/grpc-js');

let PACKAGE_DEFINITION_MOCK: PackageDefinition = Object.create(null);

export const __setPackageDefinition = (packageDefinition: PackageDefinition) => {
  PACKAGE_DEFINITION_MOCK = packageDefinition;
};

export const loadPackageDefinition = () => PACKAGE_DEFINITION_MOCK;

export const { credentials, Metadata } = originalModule;
