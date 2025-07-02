'use client';

import { useState } from 'react';
import Image from 'next/image';
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
    <div className="relative w-full min-h-screen font-body">
      <Image
          src="https://placehold.co/1920x1080.png"
          alt="Abstract gold and red background"
          fill
          className="-z-10 object-cover"
          data-ai-hint="abstract gold red"
      />
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />
      <div className="relative z-10 flex justify-center w-full min-h-screen p-4 sm:p-6 md:p-8">
        <div className="w-full max-w-2xl space-y-6">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary">HabitZen</h1>
            <p className="mt-2 text-muted-foreground">Your daily companion for building better habits.</p>
          </header>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle>Today's Progress</CardTitle>
              <CardDescription>{completedCount} of {habits.length} habits completed.</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress value={progress} className="h-3" />
              {progress === 100 && habits.length > 0 && <p className="mt-4 font-semibold text-center text-primary animate-party">🎉 All habits completed! Great job! 🎉</p>}
            </CardContent>
          </Card>

          <Card className="shadow-lg border-primary/20">
            <CardHeader>
              <CardTitle>Add New Habit</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddHabit} className="flex flex-col gap-2 sm:flex-row">
                <Input
                  type="text"
                  value={newHabitName}
                  onChange={(e) => setNewHabitName(e.target.value)}
                  placeholder="e.g., Drink water, Read for 15 minutes"
                  className="flex-grow"
                />
                <Button type="submit" disabled={!newHabitName.trim()}><Plus className="w-4 h-4 mr-2" /> Add Habit</Button>
              </form>
              <Button variant="outline" className="w-full mt-4" onClick={() => setSuggestionDialogOpen(true)}>
                <Wand2 className="w-4 h-4 mr-2" />
                Need inspiration? Get AI suggestions
              </Button>
            </CardContent>
          </Card>
          
          <HabitSuggestionsDialog open={isSuggestionDialogOpen} onOpenChange={setSuggestionDialogOpen} onAddHabits={addSuggestedHabits} />

          <div className="space-y-3">
            <h2 className="text-2xl font-bold font-headline text-primary">My Habits</h2>
            {!isLoaded ? (
              <div className="space-y-3">
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
                  <Skeleton className="w-full h-24" />
              </div>
            ) : habits.length === 0 ? (
              <Card className="flex flex-col items-center justify-center p-8 text-center border-dashed shadow-none bg-card/70">
                <h3 className="text-xl font-semibold">No habits yet!</h3>
                <p className="mt-2 text-muted-foreground">Start by adding a new habit above.</p>
              </Card>
            ) : (
              sortedHabits.map((habit, index) => {
                const isCompleted = habit.completions[today];
                const streak = calculateStreak(habit.completions);
                const hint = habit.name.toLowerCase().split(' ').slice(0, 2).join(' ');
                return (
                  <Card 
                    key={habit.id}
                    className="flex items-center p-4 transition-all duration-300 hover:shadow-md animate-boing-in"
                    style={{ animationDelay: `${index * 75}ms`, opacity: 0 }}
                  >
                    <Image
                      src={`https://placehold.co/64x64.png`}
                      alt={habit.name}
                      width={56}
                      height={56}
                      className="mr-4 rounded-lg"
                      data-ai-hint={hint}
                    />
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
                      <div className="flex items-center mt-1 text-muted-foreground">
                        <Flame className={`w-4 h-4 mr-1 ${streak > 0 ? 'text-primary' : ''}`} />
                        <span>{streak} day streak</span>
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
    </div>
  );
}
