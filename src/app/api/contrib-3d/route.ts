import { NextRequest, NextResponse } from 'next/server';
import {
  generateContrib3dSvg,
  isContrib3dStyleId,
} from '@/lib/contrib-3d';

export const runtime = 'nodejs';

function generateETag(content: string): string {
  let h1 = 0xdeadbeef;
  let h2 = 0x41c6ce57;
  for (let i = 0; i < content.length; i++) {
    const ch = content.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return `"${(4294967296 * (2097151 & h2) + (h1 >>> 0)).toString(16)}"`;
}

function generateErrorCard(message: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">
  <rect x="0" y="0" width="640" height="160" rx="12" fill="#0d1117"/>
  <rect x="0" y="0" width="640" height="160" rx="12" fill="none" stroke="#f85149" stroke-width="2"/>
  <text x="320" y="60" text-anchor="middle" font-size="18" font-weight="bold" fill="#f85149" font-family="system-ui, sans-serif">
    Error
  </text>
  <text x="320" y="95" text-anchor="middle" font-size="14" fill="#c9d1d9" font-family="system-ui, sans-serif">
    ${message.replace(/[<>&]/g, '')}
  </text>
</svg>
  `.trim();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const styleParam = searchParams.get('style') || 'green';
  const animate = searchParams.get('animate') !== 'false';
  const yearParam = searchParams.get('year');
  const year = yearParam ? Number(yearParam) : null;

  if (!username) {
    return new NextResponse(generateErrorCard('Username is required'), {
      status: 400,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  }

  if (!isContrib3dStyleId(styleParam)) {
    return new NextResponse(
      generateErrorCard(
        'Invalid style. Use green, season, south-season, night-view, night-green, night-rainbow, or gitblock'
      ),
      {
        status: 400,
        headers: {
          'Content-Type': 'image/svg+xml',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders,
        },
      }
    );
  }

  if (yearParam && Number.isNaN(year)) {
    return new NextResponse(generateErrorCard('YEAR must be a number'), {
      status: 400,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  }

  try {
    const svg = await generateContrib3dSvg(username, styleParam, {
      animate,
      year,
    });

    const etag = generateETag(svg);
    const ifNoneMatch = request.headers.get('if-none-match');

    if (ifNoneMatch && ifNoneMatch === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          'Cache-Control':
            'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
          ...corsHeaders,
        },
      });
    }

    return new NextResponse(svg, {
      status: 200,
      headers: {
        'Content-Type': 'image/svg+xml',
        ETag: etag,
        'Cache-Control':
          'public, max-age=3600, s-maxage=3600, stale-while-revalidate=600',
        ...corsHeaders,
      },
    });
  } catch (error) {
    console.error('Error generating 3D contribution profile:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to generate 3D profile';

    return new NextResponse(generateErrorCard(errorMessage), {
      status: 500,
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders,
      },
    });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      ...corsHeaders,
      'Access-Control-Max-Age': '86400',
    },
  });
}
