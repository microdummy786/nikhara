import { supabase } from '../lib/supabase';
import type { User } from '../types';
import { getTimeUntilReset } from './timeService';

/**
 * Custom error class for token exhaustion
 */
export class TokenExhaustedError extends Error {
  timeUntilReset: { hours: number; minutes: number; seconds: number };
  
  constructor(message: string, timeUntilReset: { hours: number; minutes: number; seconds: number }) {
    super(message);
    this.name = 'TokenExhaustedError';
    this.timeUntilReset = timeUntilReset;
  }
}

/**
 * Get or create a device ID for anonymous users
 */
export const getOrCreateDeviceId = (): string => {
  const stored = localStorage.getItem('device_id');
  if (stored) return stored;
  
  const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  localStorage.setItem('device_id', deviceId);
  return deviceId;
};

/**
 * Get current UTC date string (YYYY-MM-DD)
 */
const getCurrentDate = (): string => {
  const now = new Date();
  return now.toISOString().split('T')[0];
};

/**
 * Get current user's token balance for today
 * This function ensures tokens only reset at 00:00 UTC
 */
export const getDailyTokens = async (userId?: string, deviceId?: string): Promise<number> => {
  try {
    const today = getCurrentDate();
    
    // Determine if user or device
    const identifier = userId || deviceId || getOrCreateDeviceId();
    const isUser = !!userId;
    
    // Check if token record exists for today
    const { data, error } = await supabase
      .from('daily_tokens')
      .select('tokens_remaining')
      .match({
        [isUser ? 'user_id' : 'device_id']: identifier,
        date: today
      })
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error fetching daily tokens:', error);
      return 0;
    }
    
    if (data) {
      // Token record exists for today, return current balance
      // Tokens will only reset when a new record is created for a new date at 00:00 UTC
      return data.tokens_remaining;
    }
    
    // No record for today, create new record with initial tokens
    // This happens automatically when the date changes to a new day
    const initialTokens = await getInitialTokenAmount(isUser, userId);
    
    const { error: insertError } = await supabase
      .from('daily_tokens')
      .insert({
        [isUser ? 'user_id' : 'device_id']: identifier,
        date: today,
        tokens_remaining: initialTokens
      });
    
    if (insertError) {
      console.error('Error creating daily token record:', insertError);
      return initialTokens; // Return fallback value
    }
    
    return initialTokens;
  } catch (error) {
    console.error('Error in getDailyTokens:', error);
    // Return fallback based on user type
    return userId ? 150 : 30;
  }
};

/**
 * Deduct tokens from user/device
 * Throws TokenExhaustedError if tokens are insufficient
 */
export const deductTokens = async (userId?: string, deviceId?: string, amount: number = 1): Promise<boolean> => {
  try {
    const today = getCurrentDate();
    const identifier = userId || deviceId || getOrCreateDeviceId();
    const isUser = !!userId;
    
    const currentTokens = await getDailyTokens(userId, deviceId);
    
    if (currentTokens < amount) {
      // Get time until reset and throw custom error
      const timeUntilReset = await getTimeUntilReset();
      const userType = isUser ? 'user' : 'visitor';
      const tokenCost = amount === 10 ? 'generation (10 tokens)' : `pre-generated brief (${amount} token${amount > 1 ? 's' : ''})`;
      
      throw new TokenExhaustedError(
        `You have run out of tokens. New brief ${tokenCost} costs ${amount} tokens, but you have ${currentTokens} remaining. Please come back after 00:00 UTC to generate/get more briefs.`,
        timeUntilReset
      );
    }
    
    const { error } = await supabase
      .from('daily_tokens')
      .update({ tokens_remaining: currentTokens - amount })
      .match({
        [isUser ? 'user_id' : 'device_id']: identifier,
        date: today
      });
    
    if (error) {
      console.error('Error deducting tokens:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    // Re-throw TokenExhaustedError
    if (error instanceof TokenExhaustedError) {
      throw error;
    }
    console.error('Error in deductTokens:', error);
    return false;
  }
};

/**
 * Get initial token amount based on user type
 */
const getInitialTokenAmount = async (isUser: boolean, userId?: string): Promise<number> => {
  if (!isUser || !userId) {
    return 30; // Free/anonymous users
  }
  
  // Check if user is paid
  const { data } = await supabase
    .from('profiles')
    .select('payment')
    .eq('id', userId)
    .single();
  
  if (data && data.payment === 'paid') {
    return 150; // Paid users
  }
  
  return 30; // Unpaid users
};

/**
 * Refund tokens to user/device
 */
export const refundTokens = async (userId?: string, deviceId?: string, amount: number = 1): Promise<void> => {
  try {
    const today = getCurrentDate();
    const identifier = userId || deviceId || getOrCreateDeviceId();
    const isUser = !!userId;
    
    const currentTokens = await getDailyTokens(userId, deviceId);
    
    const { error } = await supabase
      .from('daily_tokens')
      .update({ tokens_remaining: currentTokens + amount })
      .match({
        [isUser ? 'user_id' : 'device_id']: identifier,
        date: today
      });
    
    if (error) {
      console.error('Error refunding tokens:', error);
    }
  } catch (error) {
    console.error('Error in refundTokens:', error);
  }
};

/**
 * Get next token reset time (00:00 UTC tomorrow)
 */
export const getNextResetTime = (): Date => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  tomorrow.setUTCHours(0, 0, 0, 0);
  return tomorrow;
};

/**
 * Format time until next reset
 */
export const formatTimeUntilReset = (): string => {
  const resetTime = getNextResetTime();
  const now = new Date();
  const diff = resetTime.getTime() - now.getTime();
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  return `${hours}h ${minutes}m`;
};

