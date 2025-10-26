import { supabase } from '../lib/supabase';

/**
 * Get current server time (UTC) from Supabase
 * This prevents users from manipulating time by changing their system clock
 */
export const getServerTime = async (): Promise<Date> => {
  try {
    // Query Supabase to get the current server time
    const { data, error } = await supabase.rpc('get_server_time');
    
    if (error) {
      console.warn('Failed to get server time, falling back to client time:', error);
      // Fallback to client time if RPC fails
      return new Date();
    }
    
    return new Date(data);
  } catch (error) {
    console.error('Error getting server time:', error);
    // Fallback to client time
    return new Date();
  }
};

/**
 * Calculate time until next 00:00 UTC reset
 */
export const getTimeUntilReset = async (): Promise<{ hours: number; minutes: number; seconds: number }> => {
  try {
    const now = await getServerTime();
    
    // Get tomorrow at 00:00 UTC
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    
    const diff = tomorrow.getTime() - now.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return { hours, minutes, seconds };
  } catch (error) {
    console.error('Error calculating time until reset:', error);
    return { hours: 0, minutes: 0, seconds: 0 };
  }
};

/**
 * Format time until reset as a readable string
 */
export const formatTimeUntilReset = async (): Promise<string> => {
  const { hours, minutes } = await getTimeUntilReset();
  
  if (hours > 0) {
    return `${hours}h ${minutes}m until 00:00 UTC`;
  }
  return `${minutes}m until 00:00 UTC`;
};

