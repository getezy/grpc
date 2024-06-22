import type { ServiceClientConstructor } from '@grpc/grpc-js';

export function isServiceClientConstructor(object: any): object is ServiceClientConstructor {
  return 'serviceName' in object;
}
