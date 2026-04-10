export interface WindowState {
  id: string;
  title: string;
  icon: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  isFocused: boolean;
}

export interface USBPacket {
  type: "MOVE" | "CLICK" | "SCROLL" | "GESTURE";
  x?: number;
  y?: number;
  action?: "down" | "up" | "move";
  timestamp: number;
}

export interface CursorState {
  x: number;
  y: number;
  isDown: boolean;
}
