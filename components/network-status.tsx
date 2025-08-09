"use client";

import { Wifi, WifiOff, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NetworkConfig } from "@/lib/network-service";

interface NetworkStatusProps {
  config: NetworkConfig;
  onConfigureClick: () => void;
}

export function NetworkStatus({
  config,
  onConfigureClick,
}: NetworkStatusProps) {
  return (
    <div className="flex items-center space-x-2">
      <Badge
        variant={config.enabled ? "success" : "outline"}
        className={cn("flex items-center space-x-1 px-2 py-1")}
      >
        {config.enabled ? (
          <>
            <Wifi className="h-3 w-3" />
            <span>Network</span>
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3" />
            <span>Simulation</span>
          </>
        )}
      </Badge>

      <Button
        variant="ghost"
        size="sm"
        className="h-8 px-2"
        onClick={onConfigureClick}
      >
        <Settings className="h-4 w-4" />
      </Button>
    </div>
  );
}
