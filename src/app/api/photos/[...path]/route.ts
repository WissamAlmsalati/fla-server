import { NextResponse } from 'next/server';
import { readFileSync, statSync } from 'fs';
import { join } from 'path';

export async function GET(request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  try {
    const { path: filePathParams } = await params;
    const filePath = join(process.cwd(), 'public', 'photos', ...filePathParams);

    // Security check to prevent path traversal
    if (!filePath.startsWith(join(process.cwd(), 'public', 'photos'))) {
      return new NextResponse('Forbidden', { status: 403 });
    }

    try {
      const stat = statSync(filePath);
      if (!stat.isFile()) {
        return new NextResponse('Not found', { status: 404 });
      }
      
      const fileBuffer = readFileSync(filePath);
      
      // Determine content type based on extension
      const ext = filePath.split('.').pop()?.toLowerCase();
      let contentType = 'application/octet-stream';
      
      if (ext === 'png') contentType = 'image/png';
      else if (ext === 'jpg' || ext === 'jpeg') contentType = 'image/jpeg';
      else if (ext === 'gif') contentType = 'image/gif';
      else if (ext === 'webp') contentType = 'image/webp';
      else if (ext === 'svg') contentType = 'image/svg+xml';
      else if (ext === 'pdf') contentType = 'application/pdf';

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (e) {
      return new NextResponse('Not found', { status: 404 });
    }
  } catch (error) {
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}