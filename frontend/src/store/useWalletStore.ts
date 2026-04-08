import { create } from 'zustand';

interface WalletState {
  address: string | null;
  isConnected: boolean;
  isWatchOnly: boolean;
  setAddress: (address: string | null, isWatchOnly?: boolean) => void;
  disconnect: () => void;
}

export const useWalletStore = create<WalletState>((set) => ({
  address: null,
  isConnected: false,
  isWatchOnly: false,
  setAddress: (address, isWatchOnly = false) => set({ 
    address, 
    isConnected: !!address,
    isWatchOnly: !!address && isWatchOnly 
  }),
  disconnect: () => set({ address: null, isConnected: false, isWatchOnly: false }),
}));
