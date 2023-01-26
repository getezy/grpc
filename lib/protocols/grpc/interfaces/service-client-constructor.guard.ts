import type { ServiceClientConstructor } from '@grpc/grpc-js';

export function instanceOfServiceClientConstructor(
  object: any
): object is ServiceClientConstructor {
  return 'serviceName' in object;
}
