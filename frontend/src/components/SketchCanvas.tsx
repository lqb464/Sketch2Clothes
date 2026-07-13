import { useCallback, useEffect, useRef, useState } from "react";
import { floodFill, isCanvasBlank } from "../utils/canvasUtils";

export type Tool = "pen" | "eraser" | "fill";

interface SketchCanvasProps {
  onSketchChange: (dataUrl: string | null) => void;
  width?: number;
  height?: number;
}

const MAX_UNDO = 20;

export const PALETTE = [
  "#000000",
  "#ffffff",
  "#e53935",
  "#1e88e5",
  "#43a047",
  "#fdd835",
  "#fb8c00",
  "#8e24aa",
  "#795548",
  "#546e7a",
  "#ec407a",
  "#26c6da",
] as const;

export default function SketchCanvas({
  onSketchChange,
  width = 512,
  height = 512,
}: SketchCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [penSize, setPenSize] = useState(4);
  const [isDrawing, setIsDrawing] = useState(false);
  const undoStack = useRef<ImageData[]>([]);

  const getContext = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getContext("2d");
  }, []);

  const initCanvas = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    undoStack.current = [ctx.getImageData(0, 0, width, height)];
  }, [getContext, width, height]);

  useEffect(() => {
    initCanvas();
  }, [initCanvas]);

  const pushUndo = useCallback(() => {
    const ctx = getContext();
    if (!ctx) return;
    const snapshot = ctx.getImageData(0, 0, width, height);
    undoStack.current = [...undoStack.current.slice(-MAX_UNDO + 1), snapshot];
  }, [getContext, width, height]);

  const exportSketch = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (isCanvasBlank(canvas)) {
      onSketchChange(null);
      return;
    }
    onSketchChange(canvas.toDataURL("image/png"));
  }, [onSketchChange]);

  const handleClear = () => {
    initCanvas();
    onSketchChange(null);
  };

  const getPoint = (event: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ("touches" in event) {
      const touch = event.touches[0] ?? event.changedTouches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (event.clientX - rect.left) * scaleX,
      y: (event.clientY - rect.top) * scaleY,
    };
  };

  const handlePointerDown = (event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPoint(event);

    if (tool === "fill") {
      pushUndo();
      floodFill(ctx, x, y, color, width, height);
      exportSketch();
      return;
    }

    pushUndo();
    setIsDrawing(true);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerMove = (event: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || tool === "fill") return;
    event.preventDefault();
    const ctx = getContext();
    if (!ctx) return;
    const { x, y } = getPoint(event);
    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color;
    ctx.lineWidth = tool === "pen" ? penSize : penSize * 3;
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const handlePointerUp = () => {
    if (!isDrawing || tool === "fill") return;
    setIsDrawing(false);
    exportSketch();
  };

  const handleUndo = () => {
    const ctx = getContext();
    if (!ctx || undoStack.current.length <= 1) return;
    undoStack.current.pop();
    const prev = undoStack.current[undoStack.current.length - 1];
    ctx.putImageData(prev, 0, 0);
    exportSketch();
  };

  const cursorClass =
    tool === "fill" ? "canvas-fill" : tool === "eraser" ? "canvas-eraser" : "canvas-pen";

  return (
    <div className="sketch-canvas">
      <div className="panel-controls">
        <div className="controls-row">
          <div className="controls-row-primary toolbar-tools">
            <button
              type="button"
              className={tool === "pen" ? "active" : ""}
              onClick={() => setTool("pen")}
            >
              Bút
            </button>
            <button
              type="button"
              className={tool === "fill" ? "active" : ""}
              onClick={() => setTool("fill")}
            >
              Tô màu
            </button>
            <button
              type="button"
              className={tool === "eraser" ? "active" : ""}
              onClick={() => setTool("eraser")}
            >
              Tẩy
            </button>
            <label className="pen-size">
              Cỡ nét
              <input
                type="range"
                min={2}
                max={20}
                value={penSize}
                onChange={(e) => setPenSize(Number(e.target.value))}
                disabled={tool === "fill"}
              />
              <span>{penSize}px</span>
            </label>
          </div>
          <div className="controls-row-actions">
            <button type="button" onClick={handleUndo}>
              Hoàn tác
            </button>
            <button type="button" onClick={handleClear}>
              Xóa hết
            </button>
          </div>
        </div>

        <div className="color-palette">
          {PALETTE.map((swatch) => (
            <button
              key={swatch}
              type="button"
              className={`swatch${color === swatch ? " selected" : ""}${
                swatch === "#ffffff" ? " swatch-white" : ""
              }`}
              style={{ backgroundColor: swatch }}
              title={swatch}
              onClick={() => {
                setColor(swatch);
                if (tool === "eraser") setTool("pen");
              }}
            />
          ))}
          <label className="custom-color" title="Chọn màu tuỳ ý">
            <input
              type="color"
              value={color}
              onChange={(e) => {
                setColor(e.target.value);
                if (tool === "eraser") setTool("pen");
              }}
            />
            <span>+</span>
          </label>
          <span className="current-color" style={{ backgroundColor: color }} />
        </div>
      </div>

      <div className="panel-visual">
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className={`canvas ${cursorClass}`}
          onMouseDown={handlePointerDown}
          onMouseMove={handlePointerMove}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
          onTouchStart={handlePointerDown}
          onTouchMove={handlePointerMove}
          onTouchEnd={handlePointerUp}
        />
      </div>

      <div className="panel-footer">
        <p className="hint">
          Bút màu / tô vùng như Paint — xong thì nhấn Tạo ảnh bên phải
        </p>
      </div>
    </div>
  );
}
