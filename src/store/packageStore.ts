import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface Package {
  id: string;
  name: string;
  price: number;
  features_count: number;
  description: string;
}

interface PackageState {
  packages: Package[];
  loading: boolean;
  selectedPackage: Package | null;
  fetchPackages: () => Promise<void>;
  setSelectedPackage: (pkg: Package | null) => void;
}

export const usePackageStore = create<PackageState>((set) => ({
  packages: [],
  loading: false,
  selectedPackage: null,
  
  fetchPackages: async () => {
    set({ loading: true });
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .order('price', { ascending: false });
      
    if (error) throw error;
    set({ packages: data || [], loading: false });
  },
  
  setSelectedPackage: (pkg) => set({ selectedPackage: pkg }),
}));