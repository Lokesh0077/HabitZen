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
  let currentDate = new Date();

  // If today is not completed, the current streak is based on days before today.
  const todayStr = getTodayDateString();
  if (!completions[todayStr]) {
    currentDate.setDate(currentDate.getDate() - 1);
  }

  // Count backwards from `currentDate`
  while (true) {
    const dateStr = new Date(
      currentDate.getTime() - currentDate.getTimezoneOffset() * 60000
    )
      .toISOString()
      .split('T')[0];
      
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
      const today = getTodayDateString();
      const dayOfWeekIndex = now.getDay();
      const daysOfWeek: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      const todayDayName = daysOfWeek[dayOfWeekIndex];

      habits.forEach(habit => {
        const isCompleted = habit.completions[today];
        if (isCompleted) {
          return;
        }

        const isForToday = !habit.days || habit.days.length === 0 || habit.days.includes(todayDayName);
        if (!isForToday) {
          return;
        }
        
        if (habit.time) {
          const [hours, minutes] = habit.time.split(':').map(Number);
          
          const reminderTime = new Date();
          reminderTime.setHours(hours, minutes, 0, 0);
          reminderTime.setMinutes(reminderTime.getMinutes() - 5);

          if (
            now.getHours() === reminderTime.getHours() &&
            now.getMinutes() === reminderTime.getMinutes()
          ) {
            new Notification('HabitZen Reminder', {
              body: "Almost time! Your habit '" + habit.name + "' is in 5 minutes.",
            });
          }
        } else {
          const currentTime = "" + now.getHours().toString().padStart(2, '0') + ":" + now.getMinutes().toString().padStart(2, '0');
          if (currentTime === '12:00' || currentTime === '23:00') {
            new Notification('HabitZen Reminder', {
              body: "Don't forget to complete your habit: '" + habit.name + "'",
            });
          }
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

  const editHabit = useCallback((id: string, updates: { name: string; time?: string; days?: Day[] }) => {
    setHabits(prev =>
      prev.map(habit => {
        if (habit.id === id) {
          return {
            ...habit,
            name: updates.name.trim(),
            time: updates.time || undefined,
            days: updates.days && updates.days.length > 0 ? updates.days : undefined,
          };
        }
        return habit;
      })
    );
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

  return { habits, addHabit, addSuggestedHabits, deleteHabit, toggleHabit, editHabit, isLoaded, calculateStreak, getTodayDateString, notificationPermission, requestNotificationPermission };
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
