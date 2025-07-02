'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/use-habits';
import type { Day } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Flame, Check, MoreHorizontal, Trash2, Wand2, Plus, Clock, CalendarDays } from 'lucide-react';
import { HabitSuggestionsDialog } from './habit-suggestions-dialog';
import { Skeleton } from '@/components/ui/skeleton';

const daysOfWeek: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function HabitPage() {
  const { habits, addHabit, addSuggestedHabits, toggleHabit, deleteHabit, isLoaded, calculateStreak, getTodayDateString } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitTime, setNewHabitTime] = useState('');
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const [isSuggestionDialogOpen, setSuggestionDialogOpen] = useState(false);

  const today = getTodayDateString();
  const todayJsDate = new Date();
  const dayOfWeekIndex = todayJsDate.getDay();
  const todayDayName = daysOfWeek[dayOfWeekIndex];

  const sortedHabits = [...habits].sort((a, b) => {
    if (a.time && b.time) return a.time.localeCompare(b.time);
    if (a.time) return -1;
    if (b.time) return 1;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  });

  const habitsForToday = sortedHabits.filter(habit => {
    if (!habit.days || habit.days.length === 0) {
      return true;
    }
    return habit.days.includes(todayDayName);
  });

  const completedCount = habitsForToday.filter(h => h.completions[today]).length;
  const progress = habitsForToday.length > 0 ? (completedCount / habitsForToday.length) * 100 : 0;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName.trim()) {
      addHabit(newHabitName, {
        time: newHabitTime,
        days: selectedDays.length > 0 ? selectedDays : undefined,
      });
      setNewHabitName('');
      setNewHabitTime('');
      setSelectedDays([]);
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
    <div className="flex justify-center w-full min-h-screen p-4 font-body sm:p-6 md:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-4xl font-bold tracking-tighter md:text-6xl text-primary">HabitZen</h1>
          <p className="mt-2 text-muted-foreground">The future of habit tracking is here.</p>
        </header>

        <Card className="shadow-lg border-primary/20 bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>{completedCount} of {habitsForToday.length} habits completed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            {progress === 100 && habitsForToday.length > 0 && <p className="mt-4 font-semibold text-center text-primary animate-party">🎉 All habits completed! Great job! 🎉</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20 bg-card/30 backdrop-blur-md">
          <CardHeader>
            <CardTitle>Add New Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHabit} className="flex flex-col gap-4">
              <Input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Drink water, Read for 15 minutes"
              />
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="flex-1">
                    <label htmlFor="habit-time" className="block mb-2 text-sm font-medium text-muted-foreground">Time (optional)</label>
                    <Input
                        id="habit-time"
                        type="time"
                        value={newHabitTime}
                        onChange={(e) => setNewHabitTime(e.target.value)}
                    />
                </div>
                <div className="flex-1">
                    <label className="block mb-2 text-sm font-medium text-muted-foreground">Repeat on (optional)</label>
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
              <div className="flex flex-col gap-2 sm:flex-row">
                <Button type="submit" disabled={!newHabitName.trim()} className="flex-grow"><Plus className="w-4 h-4 mr-2" /> Add Habit</Button>
                <Button variant="outline" className="flex-grow sm:flex-grow-0" onClick={() => setSuggestionDialogOpen(true)}>
                  <Wand2 className="w-4 h-4 mr-2" />
                  Get AI suggestions
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
        
        <HabitSuggestionsDialog open={isSuggestionDialogOpen} onOpenChange={setSuggestionDialogOpen} onAddHabits={addSuggestedHabits} />

        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-headline text-primary">My Habits for Today</h2>
          {!isLoaded ? (
            <div className="space-y-3">
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-24" />
                <Skeleton className="w-full h-24" />
            </div>
          ) : habitsForToday.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed shadow-none bg-card/30 backdrop-blur-md border-white/10">
              <h3 className="text-xl font-semibold">No habits for today!</h3>
              <p className="mt-2 text-muted-foreground">Add a new habit or check back tomorrow.</p>
            </Card>
          ) : (
            habitsForToday.map((habit, index) => {
              const isCompleted = habit.completions[today];
              const streak = calculateStreak(habit.completions);
              return (
                <Card 
                  key={habit.id}
                  className="flex items-center p-4 transition-all duration-300 hover:shadow-md animate-boing-in border-primary/20 bg-card/30 backdrop-blur-md"
                  style={{ animationDelay: `${index * 75}ms`, opacity: 0 }}
                >
                  <Button
                    variant={isCompleted ? 'default' : 'outline'}
                    size="icon"
                    className={`mr-4 w-12 h-12 rounded-full transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <Check className={`transition-transform duration-300 ${isCompleted ? 'animate-tada' : ''}`} />
                  </Button>
                  <div className="flex-grow">
                    <p className={`font-semibold text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{habit.name}</p>
                    <div className="flex flex-wrap items-center gap-x-3 mt-1 text-sm text-muted-foreground">
                      <div className="flex items-center">
                          <Flame className={`w-4 h-4 mr-1 ${streak > 0 ? 'text-primary' : ''}`} />
                          <span>{streak} day streak</span>
                      </div>
                      {habit.time && (
                          <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{habit.time}</span>
                          </div>
                      )}
                      {habit.days && habit.days.length > 0 && (
                          <div className="flex items-center">
                              <CalendarDays className="w-4 h-4 mr-1" />
                              <span>{habit.days.length === 7 ? 'Every day' : habit.days.join(', ')}</span>
                          </div>
                      )}
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="w-5 h-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => deleteHabit(habit.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
