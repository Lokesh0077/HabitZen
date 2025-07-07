'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, Day } from '@/lib/types';
import { app, messaging } from '@/lib/firebase';
import { getToken } from 'firebase/messaging';


const getTodayDateString = () => {
  const today = new Date();
  return new Date(today.getTime() - today.getTimezoneOffset() * 60000)
    .toISOString()
    .split('T')[0];
};

const calculateStreak = (completions: Record<string, boolean>): number => {
  let streak = 0;
  let currentDate = new Date();

  const todayStr = getTodayDateString();
  if (!completions[todayStr]) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = new Date(yesterday.getTime() - yesterday.getTimezoneOffset() * 60000).toISOString().split('T')[0];
    if (completions[yesterdayStr]) {
       currentDate.setDate(currentDate.getDate() - 1);
    } else {
        if(completions[todayStr]) {
            streak++;
        }
    }
  }

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

  const requestNotificationPermission = useCallback(async () => {
    if (typeof window === 'undefined' || !messaging) {
        alert('Push notifications are not supported in this browser.');
        return;
    }

    try {
        const permission = await Notification.requestPermission();
        setNotificationPermission(permission);

        if (permission === 'granted') {
            console.log('Notification permission granted.');

            const vapidKey = process.env.NEXT_PUBLIC_VAPID_KEY;
            if (!vapidKey || vapidKey === 'REPLACE_WITH_YOUR_FCM_VAPID_KEY') {
                console.error('VAPID key not found. Please set NEXT_PUBLIC_VAPID_KEY in your .env file.');
                alert('Notification setup is incomplete. Please configure the VAPID key from your Firebase project settings.');
                return;
            }
            
            // Get the token
            const currentToken = await getToken(messaging, { vapidKey: vapidKey });
            
            if (currentToken) {
                console.log('FCM Token:', currentToken);
                
                // THIS IS WHERE YOU WOULD SEND THE TOKEN TO YOUR BACKEND
                // For example:
                // await fetch('/api/save-fcm-token', {
                //     method: 'POST',
                //     headers: { 'Content-Type': 'application/json' },
                //     body: JSON.stringify({ token: currentToken }),
                // });
                
                console.log('FCM token registered. Backend integration is required to send notifications.');
            } else {
                console.log('No registration token available. Request permission to generate one.');
            }
        } else {
            console.log('Notification permission denied.');
        }
    } catch (error) {
        console.error('An error occurred while retrieving token. ', error);
        alert('An error occurred while setting up notifications. See the console for details.')
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
const uuidv4 = () => {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.randomUUID) {
        return window.crypto.randomUUID();
    }
    // Fallback for non-browser or older browser environments
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
