'use client';

import { useEffect } from 'react';
import { registerEnokiWallets } from '@mysten/enoki';
import { SuiClient } from '@mysten/sui/client';
import { SUI_RPC_URL } from '@/src/config/sui';
import {
  ENOKI_API_KEY,
  ENOKI_API_URL,
  ENOKI_CLIENT_ID,
  ENOKI_CONFIGURED,
  ENOKI_NETWORK,
  ENOKI_PROVIDER,
} from '@/src/config/enoki';

let unregisterEnokiWallets: (() => void) | null = null;

function registerEnokiIfNeeded() {
  if (typeof window === 'undefined' || !ENOKI_CONFIGURED || unregisterEnokiWallets) {
    return;
  }

  const client = new SuiClient({ url: SUI_RPC_URL });
  const { unregister } = registerEnokiWallets({
    apiKey: ENOKI_API_KEY,
    apiUrl: ENOKI_API_URL,
    client,
    network: ENOKI_NETWORK,
    windowFeatures: 'popup,width=420,height=640',
    providers: {
      [ENOKI_PROVIDER]: {
        clientId: ENOKI_CLIENT_ID,
        extraParams: () => ({ prompt: 'select_account' }),
      },
    },
  });

  unregisterEnokiWallets = unregister;
}

if (typeof window !== 'undefined') {
  registerEnokiIfNeeded();
}

export function useEnokiWalletRegistration() {
  useEffect(() => {
    registerEnokiIfNeeded();

    return () => {
      if (unregisterEnokiWallets) {
        unregisterEnokiWallets();
        unregisterEnokiWallets = null;
      }
    };
  }, []);
}
