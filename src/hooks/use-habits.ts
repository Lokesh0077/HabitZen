'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, Day } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

const getTodayDateString = () => {
  const today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

const calculateStreak = (completions: Record<string, boolean>): number => {
  let streak = 0;
  const today = new Date();
  let currentDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
  
  // Count backwards from today (or yesterday if not completed today).
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (completions[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
    } else {
      // If no completion today, check if the streak ended yesterday.
      const yesterday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];
      if (streak > 0 || !completions[yesterdayStr]) {
        break; // Streak is broken or never started
      } else {
        // Handle case where it's not completed today, but might have a streak ending yesterday
        currentDate.setDate(currentDate.getDate() - 1);
      }
    }
  }

  // A special check for the very first completion
  if (streak === 0 && completions[getTodayDateString()]) {
    return 1;
  }
  
  // If not completed today, the streak is for past consecutive days.
  if(!completions[getTodayDateString()]) {
    let pastStreak = 0;
    let pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 1);
    while(completions[pastDate.toISOString().split('T')[0]]) {
      pastStreak++;
      pastDate.setDate(pastDate.getDate() - 1);
    }
    return pastStreak;
  }


  return streak;
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const storedHabits = localStorage.getItem('habits');
      if (storedHabits) {
        setHabits(JSON.parse(storedHabits));
      }
    } catch (error) {
      console.error('Failed to load habits from localStorage', error);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('habits', JSON.stringify(habits));
      } catch (error) {
        console.error('Failed to save habits to localStorage', error);
      }
    }
  }, [habits, isLoaded]);

  const addHabit = useCallback((name: string, settings: { time?: string; days?: Day[] }) => {
    if (name.trim() === '') return;
    const newHabit: Habit = {
      id: uuidv4(),
      name: name.trim(),
      completions: {},
      createdAt: new Date().toISOString(),
      time: settings.time || undefined,
      days: settings.days && settings.days.length > 0 ? settings.days : undefined,
    };
    setHabits(prev => [...prev, newHabit]);
  }, []);

  const addSuggestedHabits = useCallback((habitsToAdd: { name: string }[]) => {
    const newHabits = habitsToAdd.map(h => ({
      id: uuidv4(),
      name: h.name,
      completions: {},
      createdAt: new Date().toISOString(),
    }));
    setHabits(prev => [...prev, ...newHabits]);
  }, []);

  const deleteHabit = useCallback((id: string) => {
    setHabits(prev => prev.filter(habit => habit.id !== id));
  }, []);

  const toggleHabit = useCallback((id: string) => {
    const today = getTodayDateString();
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === id) {
          const newCompletions = { ...habit.completions };
          newCompletions[today] = !newCompletions[today];
          return { ...habit, completions: newCompletions };
        }
        return habit;
      })
    );
  }, []);

  return { habits, addHabit, addSuggestedHabits, deleteHabit, toggleHabit, isLoaded, calculateStreak, getTodayDateString };
};

// Dummy uuidv4 implementation if 'uuid' package is not available. For browser environment it is better to use crypto.randomUUID
const v4 = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback for non-browser or older browser environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
