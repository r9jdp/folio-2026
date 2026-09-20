import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

export default async function Icon() {
  const photo = await readFile(join(process.cwd(), 'public/images/rajdeep-portrait.jpeg'));

  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        width: 64,
        height: 64,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      {/* Frame the face closely so the original photo reads clearly at tab size. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`data:image/jpeg;base64,${photo.toString('base64')}`}
        alt=""
        width={146}
        height={161}
        style={{ position: 'absolute', left: -38, top: -21, maxWidth: 146 }}
      />
    </div>,
    size,
  );
}
