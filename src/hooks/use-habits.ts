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
  const todayStr = currentDate.toISOString().split('T')[0];

  // If the habit is not completed today, check for a streak ending yesterday.
  if (!completions[todayStr]) {
      currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count backwards from `currentDate`
  while (true) {
    const dateStr = currentDate.toISOString().split('T')[0];
    if (completions[dateStr]) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      break;
    }
  }

  return streak;
};

export const useHabits = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationPermission(Notification.permission);
    }
  }, []);

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

  useEffect(() => {
    if (notificationPermission !== 'granted' || typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }

    const interval = setInterval(() => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const today = getTodayDateString();
      const todayJsDate = new Date();
      const dayOfWeekIndex = todayJsDate.getDay();
      const daysOfWeek: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayDayName = daysOfWeek[dayOfWeekIndex];

      habits.forEach(habit => {
        const isForToday = !habit.days || habit.days.length === 0 || habit.days.includes(todayDayName);
        const isCompleted = habit.completions[today];

        if (habit.time === currentTime && isForToday && !isCompleted) {
          new Notification('HabitZen Reminder', {
            body: `It's time for your habit: "${habit.name}"`,
            icon: '/favicon.ico'
          });
        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [habits, notificationPermission]);

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationPermission('granted');
        return;
      }
      if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);
      } else {
        setNotificationPermission('denied');
      }
    }
  }, []);

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

  return { habits, addHabit, addSuggestedHabits, deleteHabit, toggleHabit, isLoaded, calculateStreak, getTodayDateString, notificationPermission, requestNotificationPermission };
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
