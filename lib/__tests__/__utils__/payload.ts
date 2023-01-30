/* eslint-disable import/no-extraneous-dependencies */
import { v4 as uuid } from 'uuid';

export function generatePayload(count: number = 1) {
  const payload: { id: string }[] = [];

  for (let i = 0; i < count; i++) {
    payload.push({
      id: uuid(),
    });
  }

  return payload;
}
