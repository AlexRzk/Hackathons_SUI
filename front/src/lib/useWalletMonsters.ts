'use client';
import { useSuiClient } from '@mysten/dapp-kit';
import type { SuiObjectResponse } from '@mysten/sui/client';
import { useQuery } from '@tanstack/react-query';
import { PACKAGE_ID } from '@/src/config/chimera';

const MONSTER_TYPE = `${PACKAGE_ID}::monster_hatchery::Monster`;

const RARITY_META: Record<number, { label: string; badgeClass: string; image: string }> = {
  1: {
    label: 'Common',
    badgeClass: 'bg-gray-500/80 border border-gray-400',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9m0lmsmqdwsQ9zUzJWVr5oh9XbMu790Uylthls48OwkAUxgdJKY0qNvEjMzdMeBA3lCibsZIh1fn0TYhdrWioP8p3lgyUW0mgxcX9QHQdy5oYTM98Vxlws2MkFJrOr8IeZYNbyH1SfbndRKxvgphk4ngF5LudBGJdMKwsSh8YoWCYfCOVLeyR9nJXjQblRolVRJsJaTMge0jLQ9eJWD18g21WJV6us0oCeDPE46QByy4zqi4eVtRYwXbxa4otnN0sUQGsEoEL2Y4',
  },
  2: {
    label: 'Rare',
    badgeClass: 'bg-blue-500/80 border border-blue-400',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEXWDI_LdXUNLrR-lwXLx48ItQcVp4gZfOnYTrb_lz8gxe5yBqNPahILAkygrnxlsZNcg_pLQcdd29FFdZOD5-md253YdVx_Vol6X0tEt3DAeAFFfEfHChvXmw35i_TWVVyDq7K8KRT492oTgQGgGkQC3ElbrKL_mZtO2UJYc_muBqm2uFWYu3Baka9qTn758nlqWisqBC3EQbIAyp_rAPiXsJjU2145uYUxmGX994FhrioDeXLPILN1Z_nBVCaPzbZWSw9ZRWIJY',
  },
  3: {
    label: 'Epic',
    badgeClass: 'bg-purple-500/80 border border-purple-400',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBp1ag_vgKEHptKpNqYXu4ipkgjYxfAP24mp9EcG_LUcAZLX3rjlDD5a57bEYbg7tmHpKB9YCDjG5wihtPhzdw0euClxNB7Wnc4uD2Bt-c_wsWKK-fjQJATfz89JtkUlZjSZ2Ho-PyMGPLsKt6CWZ1XU3qd9Pf7dyzGnhg7ybcj_obztO8ThkLhNePTUzYKWVTE4pWCk4eBka_H5SgiUSXW604dfuDgMIqDRLlSe_T15fHx-Y14SNaE-3l3CavT5Kdd0gQbUVwKsfQ',
  },
  4: {
    label: 'Legendary',
    badgeClass: 'bg-yellow-500/80 border border-yellow-400 text-black',
    image:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBEiAvUM1iXpOQ_bATyNRkdQAzBaG4dJEW_vi42Skms7d3tg4NqhaHm83G7D-FrRTy2Lmu4vdc7ySCUXc-nhGIb0CoxHQ7PltGaOdV2ybGu37d8z4oTEu9C5GohPpVdYEp7GEdMRB3iz4Q6kbgvQmlDSzh2IYx5jaTRVfFwU3OGbIEwP6xhEEt4tL7caQUzpqXFMXypx2-u6GKKe6jaM0Giu6Ll7mFCBctXS0jbB6FW0dftILfa-bgvoXLzhDC1RJkpskJO5h9nBGs',
  },
};

const DEFAULT_META = {
  label: 'Unknown',
  badgeClass: 'bg-white/30 border border-white/30 text-black',
  image: 'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=800&q=80',
};

export type WalletMonster = {
  objectId: string;
  displayId: string;
  name: string;
  rarity: string;
  rarityClass: string;
  image: string;
  stats: { agi: number; int: number; pow: number };
  level: number;
  experience: number;
};

type MonsterFields = {
  id: { id: string };
  name: string;
  rarity: string;
  strength: string;
  agility: string;
  intelligence: string;
  level: string;
  experience: string;
};

function normalizeNumber(value: string | number | undefined, fallback = 0): number {
  if (typeof value === 'number') {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

function responseToMonster(response: SuiObjectResponse): WalletMonster | null {
  const data = response.data;
  if (!data) {
    return null;
  }

  const content = data.content;
  if (!content || content.dataType !== 'moveObject') {
    return null;
  }

  const fields = content.fields as Partial<MonsterFields> | undefined;
  if (!fields) {
    return null;
  }

  const rarityCode = normalizeNumber(fields.rarity, 0);
  const rarityMeta = RARITY_META[rarityCode] ?? DEFAULT_META;
  const objectId = data.objectId;
  const displayIdSource = fields.id?.id ?? objectId;

  return {
    objectId,
    displayId: `#${displayIdSource.slice(-4).toUpperCase()}`,
    name: fields.name ?? 'Unnamed',
    rarity: rarityMeta.label,
    rarityClass: rarityMeta.badgeClass,
    image: rarityMeta.image,
    stats: {
      agi: normalizeNumber(fields.agility),
      int: normalizeNumber(fields.intelligence),
      pow: normalizeNumber(fields.strength),
    },
    level: normalizeNumber(fields.level, 1),
    experience: normalizeNumber(fields.experience),
  };
}

async function fetchMonsters(client: ReturnType<typeof useSuiClient>, owner: string) {
  const monsters: WalletMonster[] = [];
  let cursor: string | null = null;

  do {
    const { data, nextCursor, hasNextPage } = await client.getOwnedObjects({
      owner,
      filter: { StructType: MONSTER_TYPE },
      options: { showContent: true },
      cursor: cursor ?? undefined,
      limit: 50,
    });

    for (const objectResponse of data) {
      const parsed = responseToMonster(objectResponse);
      if (parsed) {
        monsters.push(parsed);
      }
    }

    cursor = hasNextPage ? nextCursor ?? null : null;
  } while (cursor);

  return monsters.sort((a, b) => b.level - a.level || b.stats.pow - a.stats.pow);
}

export function useWalletMonsters(owner?: string | null) {
  const client = useSuiClient();

  const queryResult = useQuery({
    queryKey: ['wallet-monsters', owner, PACKAGE_ID],
    enabled: Boolean(owner),
    queryFn: () => {
      if (!owner) {
        return Promise.resolve<WalletMonster[]>([]);
      }

      return fetchMonsters(client, owner);
    },
    staleTime: 45_000,
    refetchInterval: owner ? 60_000 : false,
  });

  const { data = [], ...rest } = queryResult;

  return {
    ...rest,
    monsters: data,
    count: data.length,
  };
}
