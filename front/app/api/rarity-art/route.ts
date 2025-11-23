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
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Missing GEMINI_API_KEY' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const rarity = (searchParams.get('rarity') ?? 'common').toLowerCase();
  const prompt = PROMPTS[rarity] ?? PROMPTS.common;

  const response = await fetch(`${MODEL_ENDPOINT}?key=${apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildBody(prompt)),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    return NextResponse.json(
      { error: 'Gemini request failed', details: errorBody },
      { status: 502 },
    );
  }

  const data = await response.json();
  const inlineData = data?.candidates?.[0]?.content?.parts?.find((part: any) => part.inlineData)?.inlineData;

  if (!inlineData?.data) {
    return NextResponse.json({ error: 'Gemini response missing image data' }, { status: 502 });
  }

  const buffer = Buffer.from(inlineData.data, 'base64');
  return new NextResponse(buffer, {
    status: 200,
    headers: {
      'Content-Type': inlineData.mimeType ?? 'image/png',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
