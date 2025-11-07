'use client';

import { useState, useMemo } from 'react';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Check, ChevronsUpDown, UserCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { UserWithDetails } from '@/utils/users';

interface TeacherSelectorProps {
  teachers: UserWithDetails[];
  selectedTeacherId: string;
  onTeacherChange: (teacherId: string) => void;
  placeholder?: string;
  className?: string;
}

export function TeacherSelector({
  teachers,
  selectedTeacherId,
  onTeacherChange,
  placeholder = 'Select teacher...',
  className,
}: TeacherSelectorProps) {
  const [open, setOpen] = useState(false);

  const selectedTeacher = useMemo(
    () => teachers.find((teacher) => teacher.id === selectedTeacherId),
    [teachers, selectedTeacherId]
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('justify-between', className)}
        >
          {selectedTeacher ? (
            <div className="flex items-center gap-2 truncate">
              <UserCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate">{selectedTeacher.name}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search teachers by name or email..." />
          <CommandList>
            <CommandEmpty>No teachers found.</CommandEmpty>
            <CommandGroup>
              {teachers.map((teacher) => (
                <CommandItem
                  key={teacher.id}
                  value={`${teacher.name} ${teacher.email}`}
                  onSelect={() => {
                    onTeacherChange(teacher.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      selectedTeacherId === teacher.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">{teacher.name}</span>
                    <span className="text-sm text-muted-foreground">{teacher.email}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
