import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
  Pencil,
  Eraser,
  Square,
  Circle,
  ArrowRight,
  Type,
  Undo2,
  Redo2,
  Trash2,
  Download,
  Palette,
  Move,
} from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

type Tool = "pen" | "eraser" | "rectangle" | "circle" | "arrow" | "text" | "move";

interface DrawAction {
  type: Tool;
  points?: { x: number; y: number }[];
  color?: string;
  width?: number;
  startX?: number;
  startY?: number;
  endX?: number;
  endY?: number;
  text?: string;
}

interface WhiteboardPanelProps {
  className?: string;
  onDrawingChange?: (imageData: string) => void;
}

const colors = [
  "#ffffff", "#ef4444", "#f97316", "#eab308", "#22c55e",
  "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899", "#000000",
];

export function WhiteboardPanel({ className, onDrawingChange }: WhiteboardPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState("#ffffff");
  const [brushSize, setBrushSize] = useState(3);
  const [isDrawing, setIsDrawing] = useState(false);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const startPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (rect) {
        canvas.width = rect.width;
        canvas.height = rect.height;
        // Fill with dark background
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        saveToHistory();
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(0, historyIndex + 1), imageData]);
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    const coords = getCoordinates(e);
    startPoint.current = coords;
    setIsDrawing(true);

    if (tool === "pen" || tool === "eraser") {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!ctx) return;

      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
    }
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const coords = getCoordinates(e);

    if (tool === "pen") {
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    } else if (tool === "eraser") {
      ctx.lineTo(coords.x, coords.y);
      ctx.strokeStyle = "#1a1a2e";
      ctx.lineWidth = brushSize * 4;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
    }
  };

  const stopDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx || !startPoint.current) return;

    const coords = getCoordinates(e);

    if (tool === "rectangle") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.strokeRect(
        startPoint.current.x,
        startPoint.current.y,
        coords.x - startPoint.current.x,
        coords.y - startPoint.current.y
      );
    } else if (tool === "circle") {
      const radius = Math.sqrt(
        Math.pow(coords.x - startPoint.current.x, 2) +
        Math.pow(coords.y - startPoint.current.y, 2)
      );
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.arc(startPoint.current.x, startPoint.current.y, radius, 0, Math.PI * 2);
      ctx.stroke();
    } else if (tool === "arrow") {
      ctx.strokeStyle = color;
      ctx.lineWidth = brushSize;
      ctx.beginPath();
      ctx.moveTo(startPoint.current.x, startPoint.current.y);
      ctx.lineTo(coords.x, coords.y);
      ctx.stroke();

      // Draw arrowhead
      const angle = Math.atan2(
        coords.y - startPoint.current.y,
        coords.x - startPoint.current.x
      );
      const headLength = 15;
      ctx.beginPath();
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(
        coords.x - headLength * Math.cos(angle - Math.PI / 6),
        coords.y - headLength * Math.sin(angle - Math.PI / 6)
      );
      ctx.moveTo(coords.x, coords.y);
      ctx.lineTo(
        coords.x - headLength * Math.cos(angle + Math.PI / 6),
        coords.y - headLength * Math.sin(angle + Math.PI / 6)
      );
      ctx.stroke();
    }

    saveToHistory();
    
    if (onDrawingChange) {
      onDrawingChange(canvas.toDataURL());
    }
  };

  const undo = () => {
    if (historyIndex <= 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex - 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const redo = () => {
    if (historyIndex >= history.length - 1) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx) return;

    const newIndex = historyIndex + 1;
    ctx.putImageData(history[newIndex], 0, 0);
    setHistoryIndex(newIndex);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    saveToHistory();
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = "whiteboard.png";
    link.href = canvas.toDataURL();
    link.click();
  };

  const tools = [
    { id: "pen" as Tool, icon: Pencil, label: "Pen" },
    { id: "eraser" as Tool, icon: Eraser, label: "Eraser" },
    { id: "rectangle" as Tool, icon: Square, label: "Rectangle" },
    { id: "circle" as Tool, icon: Circle, label: "Circle" },
    { id: "arrow" as Tool, icon: ArrowRight, label: "Arrow" },
  ];

  return (
    <div className={cn("flex flex-col h-full rounded-xl border border-border bg-card overflow-hidden", className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-border bg-secondary/50">
        <div className="flex items-center gap-1">
          {tools.map(({ id, icon: Icon, label }) => (
            <Button
              key={id}
              size="sm"
              variant={tool === id ? "default" : "ghost"}
              className="h-8 w-8 p-0"
              onClick={() => setTool(id)}
              title={label}
            >
              <Icon className="h-4 w-4" />
            </Button>
          ))}

          <div className="w-px h-6 bg-border mx-1" />

          {/* Color picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                <div
                  className="h-5 w-5 rounded-full border-2 border-white"
                  style={{ backgroundColor: color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2">
              <div className="grid grid-cols-5 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    className={cn(
                      "h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                      color === c ? "border-primary" : "border-transparent"
                    )}
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Brush size */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="ghost" className="h-8 px-2 gap-1">
                <div
                  className="rounded-full bg-foreground"
                  style={{ width: brushSize * 2, height: brushSize * 2 }}
                />
                <span className="text-xs">{brushSize}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-3">
              <Slider
                value={[brushSize]}
                onValueChange={([v]) => setBrushSize(v)}
                min={1}
                max={20}
                step={1}
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex items-center gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={clearCanvas}
            title="Clear"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={downloadCanvas}
            title="Download"
          >
            <Download className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative bg-[#1a1a2e]">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />

        <Badge className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm text-xs">
          System Design Whiteboard
        </Badge>
      </div>
    </div>
  );
}
