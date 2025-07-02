'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { suggestHabitIdeas } from '@/ai/flows/suggest-habit-ideas';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal, PlusCircle, Loader2 } from 'lucide-react';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';


interface HabitSuggestionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddHabits: (habits: { name: string }[]) => void;
}

export function HabitSuggestionsDialog({ open, onOpenChange, onAddHabits }: HabitSuggestionsDialogProps) {
  const [interests, setInterests] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGetSuggestions = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    try {
      const result = await suggestHabitIdeas({ interests });
      setSuggestions(result.habits);
    } catch (e) {
      setError('Failed to get suggestions. Please try again.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = (habitName: string) => {
    onAddHabits([{ name: habitName }]);
    toast({
        title: "Habit Added!",
        description: `"${habitName}" has been added to your list.`,
    })
    setSuggestions(prev => prev.filter(s => s !== habitName));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Get Habit Suggestions</DialogTitle>
          <DialogDescription>
            Tell us about your interests and goals, and we'll suggest some habits for you.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="e.g., I want to be more active, learn a new skill like coding, and improve my focus."
            rows={4}
          />
          <Button onClick={handleGetSuggestions} disabled={isLoading || !interests.trim()} className="w-full">
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Get Suggestions
          </Button>

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {isLoading && (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold">Here are some ideas:</h4>
              <ul className="space-y-2">
                {suggestions.map((habit, index) => (
                  <li key={index} className="flex items-center justify-between p-2 rounded-md bg-secondary/50">
                    <span className="flex-grow">{habit}</span>
                    <Button size="sm" variant="ghost" onClick={() => handleAddHabit(habit)}>
                      <PlusCircle className="h-4 w-4 mr-1" /> Add
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
