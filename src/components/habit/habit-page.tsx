'use client';

import { useState } from 'react';
import { useHabits } from '@/hooks/use-habits';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Flame, Check, MoreHorizontal, Trash2, Wand2, Plus } from 'lucide-react';
import { HabitSuggestionsDialog } from './habit-suggestions-dialog';
import { Skeleton } from '@/components/ui/skeleton';

export function HabitPage() {
  const { habits, addHabit, addSuggestedHabits, toggleHabit, deleteHabit, isLoaded, calculateStreak, getTodayDateString } = useHabits();
  const [newHabitName, setNewHabitName] = useState('');
  const [isSuggestionDialogOpen, setSuggestionDialogOpen] = useState(false);

  const today = getTodayDateString();
  const completedCount = habits.filter(h => h.completions[today]).length;
  const progress = habits.length > 0 ? (completedCount / habits.length) * 100 : 0;

  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newHabitName) {
      addHabit(newHabitName);
      setNewHabitName('');
    }
  };
  
  const sortedHabits = [...habits].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  return (
    <div className="flex justify-center min-h-screen w-full bg-background font-body p-4 sm:p-6 md:p-8">
      <div className="w-full max-w-2xl space-y-6">
        <header className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">HabitZen</h1>
          <p className="text-muted-foreground mt-2">Your daily companion for building better habits.</p>
        </header>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle>Today's Progress</CardTitle>
            <CardDescription>{completedCount} of {habits.length} habits completed.</CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progress} className="h-3" />
            {progress === 100 && habits.length > 0 && <p className="text-center mt-4 text-primary font-semibold animate-party">🎉 All habits completed! Great job! 🎉</p>}
          </CardContent>
        </Card>

        <Card className="shadow-lg border-primary/20">
          <CardHeader>
            <CardTitle>Add New Habit</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddHabit} className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                value={newHabitName}
                onChange={(e) => setNewHabitName(e.target.value)}
                placeholder="e.g., Drink water, Read for 15 minutes"
                className="flex-grow"
              />
              <Button type="submit" disabled={!newHabitName.trim()}><Plus className="mr-2 h-4 w-4" /> Add Habit</Button>
            </form>
            <Button variant="outline" className="w-full mt-4" onClick={() => setSuggestionDialogOpen(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              Need inspiration? Get AI suggestions
            </Button>
          </CardContent>
        </Card>
        
        <HabitSuggestionsDialog open={isSuggestionDialogOpen} onOpenChange={setSuggestionDialogOpen} onAddHabits={addSuggestedHabits} />

        <div className="space-y-3">
          <h2 className="text-2xl font-bold font-headline text-primary">My Habits</h2>
          {!isLoaded ? (
             <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
          ) : habits.length === 0 ? (
            <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed shadow-none">
              <h3 className="text-xl font-semibold">No habits yet!</h3>
              <p className="text-muted-foreground mt-2">Start by adding a new habit above.</p>
            </Card>
          ) : (
            sortedHabits.map((habit, index) => {
              const isCompleted = habit.completions[today];
              const streak = calculateStreak(habit.completions);
              return (
                <Card 
                  key={habit.id}
                  className="flex items-center p-4 transition-all duration-300 hover:shadow-md animate-boing-in"
                  style={{ animationDelay: `${index * 75}ms`, opacity: 0 }}
                >
                  <Button
                    variant={isCompleted ? 'default' : 'outline'}
                    size="icon"
                    className={`w-12 h-12 rounded-full transition-all duration-300 ${isCompleted ? 'bg-primary text-primary-foreground' : 'bg-transparent'}`}
                    onClick={() => toggleHabit(habit.id)}
                  >
                    <Check className={`transition-transform duration-300 ${isCompleted ? 'animate-tada' : ''}`} />
                  </Button>
                  <div className="flex-grow ml-4">
                    <p className={`font-semibold text-lg ${isCompleted ? 'line-through text-muted-foreground' : ''}`}>{habit.name}</p>
                    <div className="flex items-center text-muted-foreground mt-1">
                      <Flame className={`h-4 w-4 mr-1 ${streak > 0 ? 'text-amber-500' : ''}`} />
                      <span>{streak} day streak</span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onSelect={() => deleteHabit(habit.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="h-4 w-4 mr-2" />
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
