import { Clock } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

interface DurationDropdownProps {
  duration: number | null;
  onDurationChange: (duration: number) => void;
}

export function DurationDropdown({ duration, onDurationChange }: DurationDropdownProps) {
  const durations = [2, 5, 10, 20, 60];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="icon" className="h-8 w-8">
          <Clock className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {durations.map((d) => (
          <DropdownMenuItem
            key={d}
            onClick={() => onDurationChange(d)}
            className={duration === d ? 'bg-accent' : ''}
          >
            {d}s
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
