import React, { useState, useEffect, useCallback, useRef } from 'react';
import { WindowState, USBPacket, CursorState } from './types';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Monitor, 
  Search, 
  Menu, 
  X, 
  Minus, 
  Square, 
  Maximize2, 
  Folder, 
  Settings, 
  Cpu, 
  MousePointer2,
  Usb
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';

// --- Components ---

interface TaskbarIconProps {
  key?: string | number;
  icon: any;
  label: string;
  isActive?: boolean;
  onClick: () => void;
}

const TaskbarIcon = ({ icon: Icon, label, isActive, onClick }: TaskbarIconProps) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button 
          onClick={onClick}
          className={`relative p-2 rounded-lg transition-all duration-200 group ${isActive ? 'bg-white/20' : 'hover:bg-white/10'}`}
        >
          <Icon className={`w-6 h-6 ${isActive ? 'text-white' : 'text-white/70 group-hover:text-white'}`} />
          {isActive && (
            <motion.div 
              layoutId="active-indicator"
              className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 bg-white rounded-full"
            />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="top">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

interface DesktopIconProps {
  key?: string | number;
  icon: any;
  label: string;
  onClick: () => void;
}

const DesktopIcon = ({ icon: Icon, label, onClick }: DesktopIconProps) => (
  <button 
    onClick={onClick}
    className="flex flex-col items-center gap-1 p-4 rounded-xl hover:bg-white/10 transition-colors w-24 group"
  >
    <div className="p-3 bg-white/10 rounded-2xl group-hover:bg-white/20 transition-colors shadow-lg backdrop-blur-sm">
      <Icon className="w-8 h-8 text-white" />
    </div>
    <span className="text-xs font-medium text-white text-shadow-sm">{label}</span>
  </button>
);

const Window = ({ 
  window, 
  onClose, 
  onMinimize, 
  onFocus, 
  onMove, 
  onResize 
}: { 
  window: WindowState, 
  onClose: () => void, 
  onMinimize: () => void, 
  onFocus: () => void,
  onMove: (x: number, y: number) => void,
  onResize: (w: number, h: number) => void
}) => {
  const isDragging = useRef(false);
  const isResizing = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });
  const startSize = useRef({ w: 0, h: 0 });

  const handleHeaderMouseDown = (e: React.MouseEvent) => {
    onFocus();
    isDragging.current = true;
    startPos.current = { x: e.clientX - window.x, y: e.clientY - window.y };
    
    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isDragging.current) {
        onMove(moveEvent.clientX - startPos.current.x, moveEvent.clientY - startPos.current.y);
      }
    };
    
    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    isResizing.current = true;
    startPos.current = { x: e.clientX, y: e.clientY };
    startSize.current = { w: window.width, h: window.height };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (isResizing.current) {
        const dw = moveEvent.clientX - startPos.current.x;
        const dh = moveEvent.clientY - startPos.current.y;
        onResize(Math.max(300, startSize.current.w + dw), Math.max(200, startSize.current.h + dh));
      }
    };

    const onMouseUp = () => {
      isResizing.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  if (window.isMinimized) return null;

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ 
        scale: 1, 
        opacity: 1,
        x: window.x,
        y: window.y,
        width: window.isMaximized ? '100%' : window.width,
        height: window.isMaximized ? 'calc(100% - 48px)' : window.height,
        left: window.isMaximized ? 0 : 'auto',
        top: window.isMaximized ? 0 : 'auto',
      }}
      style={{ zIndex: window.zIndex }}
      className={`absolute bg-white/90 backdrop-blur-xl rounded-xl shadow-2xl border border-white/20 overflow-hidden flex flex-col ${window.isFocused ? 'ring-2 ring-blue-500/50' : ''}`}
      onClick={onFocus}
    >
      {/* Header */}
      <div 
        onMouseDown={handleHeaderMouseDown}
        className="h-10 bg-white/50 border-bottom border-black/5 flex items-center justify-between px-4 cursor-default select-none"
      >
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-white/50 border-none p-1">
            <Cpu className="w-3 h-3" />
          </Badge>
          <span className="text-sm font-semibold text-gray-800">{window.title}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMinimize} className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
            <Minus className="w-4 h-4 text-gray-600" />
          </button>
          <button className="p-1.5 hover:bg-black/5 rounded-md transition-colors">
            <Square className="w-3 h-3 text-gray-600" />
          </button>
          <button onClick={onClose} className="p-1.5 hover:bg-red-500/10 rounded-md transition-colors group">
            <X className="w-4 h-4 text-gray-600 group-hover:text-red-600" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-4">
        <ScrollArea className="h-full">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900">App Content: {window.title}</h2>
            <p className="text-gray-600 leading-relaxed">
              This is a simulated application window running inside the DeX-like environment. 
              You can drag the header to move the window, and use the bottom-right corner to resize.
            </p>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Card key={i} className="p-4 bg-white/50 border-white/20 shadow-sm">
                  <div className="h-24 bg-gray-100 rounded-lg mb-2 flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-gray-400" />
                  </div>
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </Card>
              ))}
            </div>
          </div>
        </ScrollArea>
      </div>

      {/* Resize Handle */}
      {!window.isMaximized && (
        <div 
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-50"
        />
      )}
    </motion.div>
  );
};

// --- Main App ---

export default function App() {
  const [windows, setWindows] = useState<WindowState[]>([]);
  const [focusedId, setFocusedId] = useState<string | null>(null);
  const [cursor, setCursor] = useState<CursorState>({ x: 400, y: 300, isDown: false });
  const [isStartMenuOpen, setIsStartMenuOpen] = useState(false);
  const [usbStatus, setUsbStatus] = useState<'disconnected' | 'connected' | 'aoa'>('disconnected');
  const [lastPacket, setLastPacket] = useState<USBPacket | null>(null);

  const desktopRef = useRef<HTMLDivElement>(null);

  // Window Management
  const openWindow = (title: string, icon: string) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newWindow: WindowState = {
      id,
      title,
      icon,
      x: 100 + windows.length * 40,
      y: 100 + windows.length * 40,
      width: 600,
      height: 400,
      zIndex: windows.length + 1,
      isMinimized: false,
      isMaximized: false,
      isFocused: true
    };
    setWindows(prev => prev.map(w => ({ ...w, isFocused: false })).concat(newWindow));
    setFocusedId(id);
    setIsStartMenuOpen(false);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (focusedId === id) setFocusedId(null);
  };

  const focusWindow = (id: string) => {
    setWindows(prev => {
      const maxZ = Math.max(0, ...prev.map(w => w.zIndex));
      return prev.map(w => ({
        ...w,
        isFocused: w.id === id,
        zIndex: w.id === id ? maxZ + 1 : w.zIndex,
        isMinimized: w.id === id ? false : w.isMinimized
      }));
    });
    setFocusedId(id);
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setWindows(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  // USB Simulation Logic
  const simulateUSBPacket = (packet: USBPacket) => {
    setLastPacket(packet);
    if (packet.type === 'MOVE' && packet.x !== undefined && packet.y !== undefined) {
      setCursor(prev => ({ ...prev, x: packet.x!, y: packet.y! }));
    } else if (packet.type === 'CLICK') {
      setCursor(prev => ({ ...prev, isDown: packet.action === 'down' }));
      
      // Simulate click at position
      if (packet.action === 'down') {
        const element = document.elementFromPoint(cursor.x, cursor.y);
        if (element instanceof HTMLElement) {
          element.click();
          // Focus the element if it's an input or button
          if (element.tagName === 'BUTTON' || element.tagName === 'INPUT') {
            element.focus();
          }
        }
      }
    } else if (packet.type === 'SCROLL') {
      // Find the scrollable element at cursor position
      const element = document.elementFromPoint(cursor.x, cursor.y);
      if (element) {
        element.scrollBy({
          top: (packet.y || 0) * 10,
          behavior: 'smooth'
        });
      }
    }
  };

  // Handle native mouse for simulation
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (usbStatus === 'disconnected') {
        setCursor(prev => ({ ...prev, x: e.clientX, y: e.clientY }));
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [usbStatus]);

  return (
    <div 
      ref={desktopRef}
      className="relative w-full h-screen bg-[#1a1a1a] overflow-hidden font-sans select-none"
      style={{
        backgroundImage: 'url("https://picsum.photos/seed/dex/1920/1080")',
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      {/* Desktop Grid */}
      <div className="absolute inset-0 p-6 grid grid-cols-[repeat(auto-fill,96px)] grid-rows-[repeat(auto-fill,112px)] gap-4 content-start">
        <DesktopIcon icon={Folder} label="My Files" onClick={() => openWindow("File Explorer", "folder")} />
        <DesktopIcon icon={Settings} label="Settings" onClick={() => openWindow("System Settings", "settings")} />
        <DesktopIcon icon={Cpu} label="Terminal" onClick={() => openWindow("Root Terminal", "cpu")} />
        <DesktopIcon icon={Monitor} label="Display" onClick={() => openWindow("Display Manager", "monitor")} />
      </div>

      {/* Windows Layer */}
      <div className="absolute inset-0 pointer-events-none">
        <AnimatePresence>
          {windows.map(window => (
            <div key={window.id} className="pointer-events-auto">
              <Window 
                window={window}
                onClose={() => closeWindow(window.id)}
                onMinimize={() => updateWindow(window.id, { isMinimized: true })}
                onFocus={() => focusWindow(window.id)}
                onMove={(x, y) => updateWindow(window.id, { x, y })}
                onResize={(width, height) => updateWindow(window.id, { width, height })}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>

      {/* Taskbar */}
      <div className="absolute bottom-0 left-0 right-0 h-12 bg-black/40 backdrop-blur-2xl border-t border-white/10 flex items-center justify-between px-4 z-[1000]">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsStartMenuOpen(!isStartMenuOpen)}
            className={`p-2 rounded-lg transition-colors ${isStartMenuOpen ? 'bg-white/20' : 'hover:bg-white/10'}`}
          >
            <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Menu className="w-4 h-4 text-white" />
            </div>
          </button>
          <div className="h-6 w-px bg-white/10 mx-2" />
          <div className="flex items-center gap-1">
            {windows.map(w => (
              <TaskbarIcon 
                key={w.id} 
                icon={Monitor} 
                label={w.title} 
                isActive={w.isFocused && !w.isMinimized}
                onClick={() => focusWindow(w.id)}
              />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/5 rounded-full border border-white/10">
            <Usb className={`w-4 h-4 ${usbStatus === 'disconnected' ? 'text-gray-500' : 'text-green-400'}`} />
            <span className="text-[10px] uppercase tracking-wider font-bold text-white/50">
              USB: {usbStatus}
            </span>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold text-white">11:37 AM</div>
            <div className="text-[10px] text-white/50">Apr 10, 2026</div>
          </div>
        </div>
      </div>

      {/* Start Menu Simulation */}
      <AnimatePresence>
        {isStartMenuOpen && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 20, opacity: 0 }}
            className="absolute bottom-14 left-4 w-80 bg-white/90 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden z-[1001]"
          >
            <div className="p-4 border-b border-black/5 bg-gray-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">M</div>
                <div>
                  <div className="text-sm font-bold text-gray-900">Marcos Master</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest">Administrator</div>
                </div>
              </div>
            </div>
            <div className="p-2">
              <div className="grid grid-cols-4 gap-2">
                {[Folder, Settings, Cpu, Monitor, Search, Usb].map((Icon, i) => (
                  <button key={i} className="flex flex-col items-center gap-1 p-2 rounded-xl hover:bg-black/5 transition-colors">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="text-[10px] text-gray-500">App {i+1}</span>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Virtual Cursor (for USB simulation) */}
      <div 
        className="absolute pointer-events-none z-[9999] transition-transform duration-75 ease-out"
        style={{ 
          transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          left: -8,
          top: -8
        }}
      >
        <MousePointer2 
          className={`w-6 h-6 drop-shadow-lg transition-transform ${cursor.isDown ? 'scale-75 text-blue-500' : 'text-white'}`} 
          fill={cursor.isDown ? 'currentColor' : 'black'}
        />
      </div>

      {/* USB Simulation Controller (Floating Panel) */}
      <Card className="absolute top-4 right-4 w-64 bg-black/80 backdrop-blur-xl border-white/10 p-4 z-[2000] text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <Usb className="w-4 h-4 text-blue-400" />
            USB Simulator
          </h3>
          <Badge variant={usbStatus === 'disconnected' ? 'secondary' : 'default'}>
            {usbStatus}
          </Badge>
        </div>
        
        <div className="space-y-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
            onClick={() => setUsbStatus(usbStatus === 'disconnected' ? 'connected' : 'disconnected')}
          >
            {usbStatus === 'disconnected' ? 'Connect Device' : 'Disconnect'}
          </Button>

          {usbStatus !== 'disconnected' && (
            <div className="space-y-2 pt-2 border-t border-white/10">
              <div className="text-[10px] text-white/40 uppercase font-bold">Manual Input</div>
              <div className="grid grid-cols-2 gap-2">
                <Button size="sm" variant="secondary" onClick={() => simulateUSBPacket({ type: 'CLICK', action: 'down', timestamp: Date.now() })}>
                  Down
                </Button>
                <Button size="sm" variant="secondary" onClick={() => simulateUSBPacket({ type: 'CLICK', action: 'up', timestamp: Date.now() })}>
                  Up
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <Button size="sm" variant="secondary" onClick={() => simulateUSBPacket({ type: 'SCROLL', y: -10, timestamp: Date.now() })}>
                  Scroll Up
                </Button>
                <Button size="sm" variant="secondary" onClick={() => simulateUSBPacket({ type: 'SCROLL', y: 10, timestamp: Date.now() })}>
                  Scroll Down
                </Button>
              </div>
              <div className="text-[10px] text-white/40 uppercase font-bold mt-2">Last Packet</div>
              <div className="bg-black/50 rounded p-2 font-mono text-[10px] text-green-400 overflow-hidden text-ellipsis">
                {lastPacket ? JSON.stringify(lastPacket) : 'Waiting...'}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
