import { supabase } from '../lib/supabase';

export const getEngineerDetails = async (userId: string) => {
  if (!userId) return false;
  
  try {
    const { data, error } = await supabase
      .from('engineers')
      .select(`
        *,
        profiles!engineers_user_id_fkey (
          email,
          first_name
        )
      `)
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching engineer details:', error);
    return null;
  }
};

export const checkEngineerStatus = async (userId: string) => {
  if (!userId) return false;

  try {
    const { data, error } = await supabase
      .from('engineers')
      .select('status')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) throw error;
    return data?.status === 'active';
  } catch (error) {
    console.error('Error checking engineer status:', error);
    return false;
  }
};