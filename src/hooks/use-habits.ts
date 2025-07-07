'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Habit, Day } from '@/lib/types';

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

// Helper to convert base64 string to Uint8Array. This is needed for the push subscription.
function urlBase64ToUint8Array(base64String: string) {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}


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
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window)) {
        alert('Push notifications are not supported in this browser.');
        return;
    }

    // Ask for permission
    const permission = await Notification.requestPermission();
    setNotificationPermission(permission);

    if (permission === 'granted') {
        console.log('Notification permission granted.');

        try {
            // Register the service worker
            const registration = await navigator.serviceWorker.register('/sw.js');
            console.log('Service Worker registered:', registration);

            // Get the VAPID public key from environment variables
            const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
            if (!vapidPublicKey || vapidPublicKey === 'REPLACE_WITH_YOUR_PUBLIC_VAPID_KEY') {
                console.error('VAPID public key not found. Please set NEXT_PUBLIC_VAPID_PUBLIC_KEY in your .env file.');
                alert('Notification setup is incomplete. Please configure the VAPID public key.');
                return;
            }
            
            // Subscribe the user
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
            });
            console.log('Push Subscription created:', subscription);

            // Here you would send the subscription to your backend server
            // The backend would store this subscription and use it to send push notifications.
            // For example:
            // await fetch('/api/save-subscription', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(subscription),
            // });
            console.log('Subscription would be sent to a backend, but this is a placeholder.');

        } catch (error) {
            console.error('Failed to register service worker or subscribe:', error);
            alert('Failed to set up notifications. See console for details.');
        }
    } else {
        console.log('Notification permission was denied.');
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
