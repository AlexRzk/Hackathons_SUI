import type { AuthProvider, EnokiNetwork } from '@mysten/enoki';

export const ENOKI_API_KEY = process.env.NEXT_PUBLIC_ENOKI_API_KEY ?? '';
export const ENOKI_API_URL = process.env.NEXT_PUBLIC_ENOKI_API_URL;
export const ENOKI_CLIENT_ID =
  process.env.NEXT_PUBLIC_ENOKI_CLIENT_ID ?? process.env.NEXT_PUBLIC_ENOKI_GOOGLE_CLIENT_ID ?? '';
export const ENOKI_PROVIDER = (process.env.NEXT_PUBLIC_ENOKI_PROVIDER as AuthProvider) ?? 'google';
export const ENOKI_NETWORK = (process.env.NEXT_PUBLIC_ENOKI_NETWORK as EnokiNetwork) ?? 'testnet';
export const ENOKI_CONFIGURED = Boolean(ENOKI_API_KEY && ENOKI_CLIENT_ID);
