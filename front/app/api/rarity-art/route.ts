import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const MODEL_ENDPOINT = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent';

const PROMPTS: Record<string, string> = {
  common:
    'Generate a square, high-detail concept art of a sci-fi incubation pod containing a common monster egg. The egg shell should have subtle glowing circuits, muted steel blues, and feel mass-produced.',
  rare:
    'Generate a square, high-detail concept art of a rare monster egg. The egg should float above a crystalline pedestal, emit teal plasma veins, and have intricate glyphs along its shell.',
  epic:
    'Generate a square, high-detail concept art of an epic monster egg. The shell should appear volcanic with molten cracks, violet lightning arcing around it, and elaborate armor plating.',
  legendary:
    'Generate a square, high-detail concept art of a legendary monster egg. Make it radiant with golden light, fractal halo rings, and mythical dragon-scale textures.',
};

const PLACEHOLDER_SVGS: Record<string, string> = {
  common: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#1f2937"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><ellipse cx="256" cy="300" rx="140" ry="190" fill="#4b5563" stroke="#9ca3af" stroke-width="8" opacity="0.9"/><circle cx="210" cy="230" r="32" fill="#a5b4fc" opacity="0.35"/><circle cx="300" cy="190" r="22" fill="#cbd5f5" opacity="0.35"/><text x="256" y="460" font-size="42" text-anchor="middle" fill="#9ca3af" font-family="'Segoe UI', sans-serif">Common Egg</text></svg>`,
  rare: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#082f49"/><stop offset="100%" stop-color="#0f172a"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><ellipse cx="256" cy="300" rx="150" ry="200" fill="#0ea5e9" stroke="#38bdf8" stroke-width="10" opacity="0.9"/><path d="M156 310 Q256 210 356 310" stroke="#e0f2fe" stroke-width="6" fill="none" opacity="0.7"/><text x="256" y="460" font-size="42" text-anchor="middle" fill="#38bdf8" font-family="'Segoe UI', sans-serif">Rare Egg</text></svg>`,
  epic: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#3b0764"/><stop offset="100%" stop-color="#1e1b4b"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><ellipse cx="256" cy="300" rx="150" ry="205" fill="#a855f7" stroke="#d946ef" stroke-width="12" opacity="0.85"/><path d="M176 270 Q256 170 336 270" stroke="#f472b6" stroke-width="6" fill="none" opacity="0.7"/><text x="256" y="460" font-size="42" text-anchor="middle" fill="#f472b6" font-family="'Segoe UI', sans-serif">Epic Egg</text></svg>`,
  legendary: `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#451a03"/><stop offset="100%" stop-color="#111827"/></linearGradient></defs><rect width="512" height="512" fill="url(#g)"/><ellipse cx="256" cy="300" rx="150" ry="210" fill="#facc15" stroke="#f97316" stroke-width="14" opacity="0.9"/><circle cx="256" cy="210" r="55" stroke="#fde047" stroke-width="6" fill="none" opacity="0.7"/><text x="256" y="460" font-size="42" text-anchor="middle" fill="#facc15" font-family="'Segoe UI', sans-serif">Legendary Egg</text></svg>`,
};

function placeholderResponse(rarity: string) {
  const svg = PLACEHOLDER_SVGS[rarity] ?? PLACEHOLDER_SVGS.common;
  return new NextResponse(svg, {
    status: 200,
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=600',
    },
  });
}

function buildBody(prompt: string) {
  return {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
    generationConfig: {
      responseMimeType: 'image/png',
      aspectRatio: '1:1',
    },
  };
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rarity = (searchParams.get('rarity') ?? 'common').toLowerCase();
  const prompt = PROMPTS[rarity] ?? PROMPTS.common;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return placeholderResponse(rarity);
  }

  try {
    const response = await fetch(`${MODEL_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(buildBody(prompt)),
    });

    if (!response.ok) {
      return placeholderResponse(rarity);
    }

    const data = await response.json();
    const inlineData = data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;

    if (!inlineData?.data) {
      return placeholderResponse(rarity);
    }

    const buffer = Buffer.from(inlineData.data, 'base64');
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': inlineData.mimeType ?? 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('[rarity-art]', error);
    return placeholderResponse(rarity);
  }
}
