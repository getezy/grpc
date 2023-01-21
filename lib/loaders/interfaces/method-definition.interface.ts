import { GrpcMethodType } from './method-type.enum';

export interface GrpcMethodDefinition {
  name: string;
  type: GrpcMethodType;
}
