"use client";

import { useEffect, useState } from "react";
import { getSocket, disconnectSocket } from "@/services/socketClient";
import { useVehicleStore } from "@/store/vehicleStore";

interface VehicleUpdatePayload {
  id: string;
  location: [number, number];
  speed: number;
  status: string;
}

export function useVehicleSocket() {
  const updatePosition = useVehicleStore((s) => s.updatePosition);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const socket = getSocket();

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);
    const onUpdate = (data: VehicleUpdatePayload) => {
      updatePosition(data.id, data.location);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("vehicle:update", onUpdate);

    // Reflect current state in case already connected
    setConnected(socket.connected);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("vehicle:update", onUpdate);
      disconnectSocket();
    };
  }, [updatePosition]);

  return { connected };
}
