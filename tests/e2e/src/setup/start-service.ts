/* eslint-disable no-console */

import { Server, ServerCredentials } from '@grpc/grpc-js';
import type { GlobalSetupContext } from 'vitest/node';

export default function setup({ provide }: GlobalSetupContext) {
  const server = new Server();

  const address = '0.0.0.0:4000';
  provide('SERVICE_ADDRESS', address);

  server.bindAsync(address, ServerCredentials.createInsecure(), () => {
    console.log('gRPC server started on 0.0.0.0:4000');
  });

  return () => {
    server.forceShutdown();
    console.log('gRPC server stopped');
  };
}

declare module 'vitest' {
  export interface ProvidedContext {
    SERVICE_ADDRESS: string;
  }
}
