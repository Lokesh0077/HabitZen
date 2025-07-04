'use client';

import type { Habit, Day } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Trophy, TrendingUp } from 'lucide-react';
import React, { useMemo } from 'react';

const calculateLongestEverStreak = (completions: Record<string, boolean>): number => {
    const completedDates = Object.keys(completions)
        .filter((date) => completions[date])
        .map(dateStr => new Date(dateStr)) 
        .sort((a, b) => a.getTime() - b.getTime());

    if (completedDates.length === 0) {
        return 0;
    }
    if (completedDates.length === 1) {
        return 1;
    }

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < completedDates.length; i++) {
        const currentDate = completedDates[i];
        const previousDate = completedDates[i - 1];
        
        const expectedNextDate = new Date(previousDate);
        expectedNextDate.setDate(expectedNextDate.getDate() + 1);

        if (currentDate.getFullYear() === expectedNextDate.getFullYear() &&
            currentDate.getMonth() === expectedNextDate.getMonth() &&
            currentDate.getDate() === expectedNextDate.getDate()) {
            currentStreak++;
        } else {
            currentStreak = 1;
        }

        if (currentStreak > longestStreak) {
            longestStreak = currentStreak;
        }
    }

    return longestStreak;
};


const getPast7DaysData = (habits: Habit[]) => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        
        const dateString = new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });

        const dayOfWeekIndex = date.getDay();
        const daysOfWeek: Day[] = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const todayDayName = daysOfWeek[dayOfWeekIndex];

        const habitsForThisDay = habits.filter(habit => {
            if (!habit.days || habit.days.length === 0) return true;
            return habit.days.includes(todayDayName);
        });

        const completedCount = habitsForThisDay.filter(h => h.completions[dateString]).length;
        const totalCount = habitsForThisDay.length;
        
        data.push({
            date: dayName,
            completed: completedCount,
            total: totalCount,
            percentage: totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0,
        });
    }
    return data;
};

const chartConfig = {
    percentage: {
      label: 'Completion %',
      color: 'hsl(var(--primary))',
    },
} satisfies ChartConfig;


export function HabitStats({ habits }: { habits: Habit[] }) {
    const weeklyData = useMemo(() => getPast7DaysData(habits), [habits]);

    const longestStreaks = useMemo(() => {
        if (!habits || habits.length === 0) {
            return [];
        }
        return habits
            .map(habit => ({
                id: habit.id,
                name: habit.name,
                streak: calculateLongestEverStreak(habit.completions),
            }))
            .filter(habit => habit.streak > 0)
            .sort((a, b) => b.streak - a.streak)
            .slice(0, 3);
    }, [habits]);

    return (
        <Card className="shadow-lg border-primary/20 bg-card/30 backdrop-blur-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-6 h-6 text-primary" />
                    Habit Statistics
                </CardTitle>
                <CardDescription>An overview of your progress.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
                <div>
                    <h3 className="font-semibold mb-4 text-center text-lg">Weekly Completion Rate</h3>
                    {habits.length > 0 ? (
                        <ChartContainer config={chartConfig} className="h-[200px] w-full">
                            <BarChart accessibilityLayer data={weeklyData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickLine={false}
                                    tickMargin={10}
                                    axisLine={false}
                                />
                                <YAxis 
                                    tickFormatter={(value) => `${value}%`}
                                    tickLine={false}
                                    axisLine={false}
                                    width={30}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent
                                        formatter={(value, name, props) => (
                                            <div className="text-sm p-1">
                                                <div className="font-bold mb-1">{props.payload.date}</div>
                                                <div>{props.payload.completed} of {props.payload.total} habits</div>
                                                <div className="text-primary font-semibold">{value}% complete</div>
                                            </div>
                                        )}
                                        hideLabel
                                    />}
                                />
                                <Bar dataKey="percentage" fill="var(--color-percentage)" radius={8} />
                            </BarChart>
                        </ChartContainer>
                    ) : (
                        <p className="text-muted-foreground text-center">Add some habits to see your stats here.</p>
                    )}
                </div>

                <div>
                    <h3 className="font-semibold mb-4 text-center text-lg">All-Time Longest Streaks</h3>
                     {longestStreaks.length > 0 ? (
                        <ul className="space-y-3">
                            {longestStreaks.map((item, index) => (
                                <li key={item.id} className="flex items-center gap-4 p-3 rounded-lg bg-secondary/50">
                                    <Trophy className={`w-6 h-6 ${index === 0 ? 'text-primary' : 'text-muted-foreground'}`} />
                                    <div className="flex-grow">
                                        <p className="font-medium">{item.name}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">{item.streak}</p>
                                        <p className="text-sm text-muted-foreground">days</p>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    ) : (
                         <p className="text-muted-foreground text-center">Complete some habits to build up a streak!</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
