import { GrpcMethodDefinition } from './method-definition.interface';

export interface GrpcServiceDefinition {
  name: string;
  methods: GrpcMethodDefinition[];
}
