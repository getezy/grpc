import { GrpcTlsType } from './tls-type.enum';

export type GrpcServerSideTlsConfig = {
  type: GrpcTlsType.SERVER_SIDE;

  rootCertificatePath?: string;
};

export type GrpcMutualTlsConfig = {
  type: GrpcTlsType.MUTUAL;

  rootCertificatePath?: string;

  clientCertificatePath: string;

  clientKeyPath: string;
};

export type GrpcInsecureTlsConfig = {
  type: GrpcTlsType.INSECURE;
};

export type GrpcTlsConfig<T extends GrpcTlsType> = T extends GrpcTlsType.MUTUAL
  ? GrpcMutualTlsConfig
  : T extends GrpcTlsType.SERVER_SIDE
    ? GrpcServerSideTlsConfig
    : GrpcInsecureTlsConfig;

export type AbstractProtocolOptions = {
  address: string;

  tls: GrpcTlsConfig<GrpcTlsType>;
};

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
