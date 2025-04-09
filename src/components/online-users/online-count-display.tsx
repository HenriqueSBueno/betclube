
import { useState, useEffect } from "react";
import { Users } from "lucide-react";
import { OnlineUsersService } from "@/services/online-users-service";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export function OnlineCountDisplay() {
  const [currentCount, setCurrentCount] = useState(0);

  // Fetch and update the counter in real-time
  useEffect(() => {
    let isMounted = true;
    let intervalId: NodeJS.Timeout;

    const updateCounter = async () => {
      if (!isMounted) return;

      try {
        const count = await OnlineUsersService.getCurrentCount();
        if (isMounted) {
          setCurrentCount(count);
        }
      } catch (error) {
        console.error('Error updating online users count:', error);
      }
    };

    // Update immediately
    updateCounter();

    // Set update interval
    intervalId = setInterval(updateCounter, 3000);

    // Clean up interval and mark component as unmounted
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, []);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-1.5 text-sm sm:text-xs">
            <div className="relative">
              <Users className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
              <span className="absolute -bottom-0.5 -right-0.5 h-1.5 w-1.5 sm:h-1 sm:w-1 rounded-full bg-green-500 animate-pulse"></span>
            </div>
            <span>{currentCount}</span>
            <span className="hidden sm:inline"> usuários ativos</span>
          </div>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          <p className="text-xs">Usuários nos últimos 30 minutos</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
