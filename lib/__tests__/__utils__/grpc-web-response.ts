import { GrpcStatus } from '@protocols';

enum FrameType {
  DATA = 0x00, // expecting a data frame
  TRAILER = 0x80, // expecting a trailer frame
}

function fourBytesLength(sized: Uint8Array) {
  const arr = new Uint8Array(4);
  const view = new DataView(arr.buffer);
  view.setUint32(0, sized.length, false);
  return arr;
}

/**
 * @fileoverview The default grpc-web stream parser
 * https://github.com/grpc/grpc-web/blob/60caece15489787662ebac6167572eecd5bfa568/javascript/net/grpc/web/grpcwebstreamparser.js#L19
 * The default grpc-web parser decodes the input stream (binary) under the
 * following rules:
 *
 * 1. The wire format looks like:
 *
 *    0x00 <data> 0x80 <trailer>
 *
 *    For details of grpc-web wire format see
 *    https://github.com/grpc/grpc/blob/master/doc/PROTOCOL-WEB.md
 *
 * 2. Messages will be delivered once each frame is completed. Partial stream
 *    segments are accepted.
 *
 * 3. Example:
 *
 * Incoming data: 0x00 <message1> 0x00 <message2> 0x80 <trailers>
 *
 * Result: [ { 0x00 : <message1 }, { 0x00 : <message2> }, { 0x80 : trailers } ]
 */
export function grpcWebResponseToBuffer(
  messages: Uint8Array[],
  status: GrpcStatus = GrpcStatus.OK
) {
  const buf = [];

  // eslint-disable-next-line no-restricted-syntax
  for (const message of messages) {
    buf.push(new Uint8Array([FrameType.DATA]), fourBytesLength(message), message);
  }

  const trailerMessage = Buffer.concat([
    Buffer.from('grpc-status:'.concat(status.toString(), '\r\n')),
    Buffer.from('grpc-message:'.concat(status.toString(), '\r\n')),
  ]);

  buf.push(new Uint8Array([FrameType.TRAILER]), fourBytesLength(trailerMessage), trailerMessage);

  return Buffer.concat(buf);
}
