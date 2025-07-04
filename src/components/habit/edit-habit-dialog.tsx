'use client';

import { useState, useEffect } from 'react';
import type { Habit, Day } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface EditHabitDialogProps {
  habit: Habit | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, updates: { name: string; time?: string; days?: Day[] }) => void;
}

const daysOfWeek: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function EditHabitDialog({ habit, open, onOpenChange, onSave }: EditHabitDialogProps) {
  const [name, setName] = useState('');
  const [time, setTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);

  useEffect(() => {
    if (habit) {
      setName(habit.name);
      setTime(habit.time || '');
      setSelectedDays(habit.days || []);
    }
  }, [habit]);

  if (!habit) {
    return null;
  }

  const handleSave = () => {
    if (name.trim()) {
      onSave(habit.id, {
        name: name,
        time: time,
        days: selectedDays,
      });
      onOpenChange(false);
    }
  };
  
  const toggleDay = (day: Day) => {
    setSelectedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day].sort((a, b) => daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b))
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Habit</DialogTitle>
          <DialogDescription>
            Make changes to your habit. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="habit-name">Habit Name</Label>
                <Input
                    id="habit-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Drink water"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="habit-time">Time (optional)</Label>
                <Input
                    id="habit-time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                />
            </div>
            <div className="space-y-2">
                <Label>Repeat on (optional)</Label>
                <div className="flex items-center justify-between gap-1">
                    {daysOfWeek.map(day => (
                        <Button
                            key={day}
                            type="button"
                            variant={selectedDays.includes(day) ? 'default' : 'outline'}
                            size="icon"
                            className="w-full h-9 sm:w-9 text-xs"
                            onClick={() => toggleDay(day)}
                        >
                            {day}
                        </Button>
                    ))}
                </div>
            </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSave} disabled={!name.trim()}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
