'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit } from '@/lib/types';
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
  const todayStr = currentDate.toISOString().split('T')[0];

  // If the habit isn't completed today, check the streak ending yesterday.
  if (!completions[todayStr]) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count backwards from the current date.
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (completions[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1); // Move to the previous day
    } else {
      break; // The streak is broken
    }
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

  const addHabit = useCallback((name: string) => {
    if (name.trim() === '') return;
    const newHabit: Habit = {
      id: uuidv4(),
      name: name.trim(),
      completions: {},
      createdAt: new Date().toISOString(),
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
