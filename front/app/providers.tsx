'use client';

import { ReactNode } from 'react';
import {
  createNetworkConfig,
  SuiClientProvider,
  WalletProvider,
} from '@mysten/dapp-kit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SUI_RPC_URL } from '../src/config/sui';
import '@mysten/dapp-kit/dist/index.css';
import { useEnokiWalletRegistration } from '@/src/lib/useEnokiWalletRegistration';

const { networkConfig } = createNetworkConfig({
  testnet: { url: SUI_RPC_URL },
});

const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
  useEnokiWalletRegistration();

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider networks={networkConfig} defaultNetwork="testnet">
        <WalletProvider autoConnect>{children}</WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
