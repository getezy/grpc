import type { MethodDefinition } from '@grpc/proto-loader';

export function instanceOfProtobufMethodDefinition<Request, Response>(
  object: any
): object is MethodDefinition<Request, Response> {
  return 'requestSerialize' in object && 'responseDeserialize' in object;
}
