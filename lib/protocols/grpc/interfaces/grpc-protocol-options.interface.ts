import { AbstractProtocolOptions } from '@protocols';

export interface GrpcChannelOptions {
  /**
   * This should be used for testing only.
   *
   * The caller of the secure_channel_create functions may override
   * the target name used for SSL host name checking using this channel
   * argument which is of type GRPC_ARG_STRING. If this argument is
   * not specified, the name used for SSL host name checking will be
   * the target parameter (assuming that the secure channel is an SSL channel).
   * If this parameter is specified and the underlying is not an SSL channel, it will just be ignored.
   */
  sslTargetNameOverride?: string;
}

export interface GrpcProtocolOptions extends AbstractProtocolOptions {
  channelOptions?: GrpcChannelOptions;
}
