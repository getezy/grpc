import type {
  MethodDefinition,
  PackageDefinition,
  ProtobufTypeDefinition,
  ServiceDefinition,
} from '@grpc/proto-loader';
import * as ProtoLoader from '@grpc/proto-loader';

import { AbstractLoader } from './abstract.loader';
import { GrpcMethodDefinition, GrpcMethodType, GrpcServiceDefinition } from './interfaces';

function instanceOfProtobufTypeDefinition(object: any): object is ProtobufTypeDefinition {
  return 'type' in object;
}

function instanceOfMethodDefinition(object: any): object is MethodDefinition<object, object> {
  return 'requestType' in object;
}

/**
 * ProtobufLoader used for load package definition from file.
 */
export class ProtobufLoader extends AbstractLoader {
  constructor(public readonly path: string, public readonly options?: ProtoLoader.Options) {
    super();
  }

  public async load(): Promise<void> {
    this.packageDefinition = await ProtoLoader.load(this.path, {
      keepCase: true,
      defaults: true,
      includeDirs: [],
      longs: String,
      ...this.options,
    });

    this.services = this.parse(this.packageDefinition);
  }

  private parse(ast: PackageDefinition): GrpcServiceDefinition[] {
    const services: GrpcServiceDefinition[] = [];

    const packages = Object.keys(ast);
    for (let i = 0; i < packages.length; i++) {
      const astItem = ast[packages[i]];

      if (!instanceOfProtobufTypeDefinition(astItem)) {
        const parsedService = this.parseService(packages[i], astItem);

        services.push(parsedService);
      }
    }

    return services;
  }

  private parseService(name: string, astService: ServiceDefinition): GrpcServiceDefinition {
    const astMethods = Object.keys(astService);

    const methods: GrpcMethodDefinition[] = [];

    for (let i = 0; i < astMethods.length; i++) {
      const astItem = astService[astMethods[i]];

      if (instanceOfMethodDefinition(astItem)) {
        const method: GrpcMethodDefinition = {
          name: astMethods[i],
          type: this.getMethodType(astItem),
        };

        methods.push(method);
      }
    }

    return {
      name,
      methods,
    };
  }

  // eslint-disable-next-line class-methods-use-this
  private getMethodType(method: MethodDefinition<object, object>): GrpcMethodType {
    if (method.requestStream && method.responseStream) {
      return GrpcMethodType.BIDIRECTIONAL_STREAMING;
    }

    if (method.requestStream) {
      return GrpcMethodType.CLIENT_STREAMING;
    }

    if (method.responseStream) {
      return GrpcMethodType.SERVER_STREAMING;
    }

    return GrpcMethodType.UNARY;
  }
}
