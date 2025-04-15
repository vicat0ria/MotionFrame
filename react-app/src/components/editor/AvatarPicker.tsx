import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface AvatarPickerProps {
  selected: number;
  onSelect: (index: number) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const avatars = [
    { name: "Avatar 1", color: "bg-blue-500" },
    { name: "Avatar 2", color: "bg-purple-500" },
    { name: "Avatar 3", color: "bg-green-500" },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-white/20 hover:bg-white/10 relative overflow-hidden"
        >
          <div className={cn("absolute inset-1 rounded-full", avatars[selected].color)} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-48 p-2" align="end">
        <div className="flex flex-col gap-2">
          {avatars.map((avatar, index) => (
            <Button
              key={avatar.name}
              variant="ghost"
              className={cn(
                "flex items-center gap-2 justify-start",
                selected === index && "bg-white/10"
              )}
              onClick={() => onSelect(index)}
            >
              <div className={cn("w-6 h-6 rounded-full", avatar.color)} />
              <span className="text-sm">{avatar.name}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
} 