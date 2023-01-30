/* eslint-disable import/no-extraneous-dependencies */
import { v4 as uuid } from 'uuid';

import { MetadataParser } from '../../protocols/grpc/grpc-metadata.parser';

export function generateMetadata(meta?: Record<string, unknown>) {
  const pureMetadata: Record<string, any> = {
    'x-access-token': uuid(),
    ...meta,
  };

  const metadata = MetadataParser.parse(pureMetadata);

  return {
    pureMetadata,
    metadata,
  };
}
