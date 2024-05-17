import { GrpcTlsType } from './grpc-tls-type.enum';

export interface GrpcServerSideTlsConfig {
  type: GrpcTlsType.SERVER_SIDE;

  rootCertificatePath?: string;
}

export interface GrpcMutualTlsConfig {
  type: GrpcTlsType.MUTUAL;

  rootCertificatePath?: string;

  clientCertificatePath: string;

  clientKeyPath: string;
}

export interface GrpcInsecureTlsConfig {
  type: GrpcTlsType.INSECURE;
}

export type GrpcTlsConfig<T extends GrpcTlsType> = T extends GrpcTlsType.MUTUAL
  ? GrpcMutualTlsConfig
  : T extends GrpcTlsType.SERVER_SIDE
    ? GrpcServerSideTlsConfig
    : GrpcInsecureTlsConfig;

export interface AbstractProtocolOptions {
  address: string;

  tls: GrpcTlsConfig<GrpcTlsType>;
}

export function isInsecureTlsConfig(
  config: GrpcTlsConfig<GrpcTlsType>
): config is GrpcTlsConfig<GrpcTlsType.INSECURE> {
  return config.type === GrpcTlsType.INSECURE;
}

export function isServerSideTlsConfig(
  config: GrpcTlsConfig<GrpcTlsType>
): config is GrpcTlsConfig<GrpcTlsType.SERVER_SIDE> {
  return config.type === GrpcTlsType.SERVER_SIDE;
}

export function isMutualTlsConfig(
  config: GrpcTlsConfig<GrpcTlsType>
): config is GrpcTlsConfig<GrpcTlsType.MUTUAL> {
  return config.type === GrpcTlsType.MUTUAL;
}
