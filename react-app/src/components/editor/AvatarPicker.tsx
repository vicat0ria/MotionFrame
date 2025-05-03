import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import avatar1 from "@/assets/avatar1.png";
import avatar2 from "@/assets/avatar2.png";
import avatar3 from "@/assets/avatar3.png";

interface AvatarPickerProps {
  selected: number;
  onSelect: (index: number) => void;
}

export function AvatarPicker({ selected, onSelect }: AvatarPickerProps) {
  const avatars = [
    { name: "Avatar 1", image: avatar1 },
    { name: "Avatar 2", image: avatar2 },
    { name: "Avatar 3", image: avatar3 },
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="w-12 h-12 rounded-full border-white/20 hover:bg-white/10 relative overflow-hidden p-0"
        >
          <img
            src={avatars[selected].image}
            alt={avatars[selected].name}
            className="w-full h-full object-cover rounded-full"
          />
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
              <div className="w-6 h-6 rounded-full overflow-hidden">
                <img
                  src={avatar.image}
                  alt={avatar.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm">{avatar.name}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
