"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface ComparisonSliderProps {
  beforeSrc: string;
  afterSrc: string;
  altBefore?: string;
  altAfter?: string;
}

export default function ComparisonSlider({
  beforeSrc,
  afterSrc,
  altBefore = "Before",
  altAfter = "After",
}: ComparisonSliderProps) {
  const [position, setPosition] = useState(50); // 0–100 percent
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const clamp = (v: number) => Math.min(100, Math.max(0, v));

  const applyPosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = clamp(((clientX - rect.left) / rect.width) * 100);
    setPosition(pct);
  }, []);

  // Mouse events
  const onMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      applyPosition(e.clientX);
    },
    [applyPosition]
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      applyPosition(e.clientX);
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [applyPosition]);

  // Touch events
  const onTouchStart = useCallback(
    (e: React.TouchEvent) => {
      dragging.current = true;
      applyPosition(e.touches[0].clientX);
    },
    [applyPosition]
  );

  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      applyPosition(e.touches[0].clientX);
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [applyPosition]);

  return (
    <div
      ref={containerRef}
      className="relative w-full select-none overflow-hidden cursor-col-resize"
      style={{ userSelect: "none" }}
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
    >
      {/* After image (full width, behind) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={afterSrc}
        alt={altAfter}
        className="w-full object-cover max-h-96 block"
        draggable={false}
      />

      {/* Before image (clipped on the left) */}
      <div
        className="absolute inset-0 overflow-hidden"
        style={{ width: `${position}%` }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={beforeSrc}
          alt={altBefore}
          className="w-full object-cover max-h-96 block"
          style={{
            width: containerRef.current
              ? `${containerRef.current.offsetWidth}px`
              : "100%",
            maxWidth: "none",
          }}
          draggable={false}
        />
      </div>

      {/* Drag handle line */}
      <div
        className="absolute inset-y-0 flex items-center justify-center"
        style={{ left: `${position}%`, transform: "translateX(-50%)" }}
      >
        {/* vertical line */}
        <div className="absolute inset-y-0 w-0.5 bg-white shadow-md" />
        {/* circle knob */}
        <div className="relative z-10 w-9 h-9 rounded-full bg-white shadow-lg border-2 border-white flex items-center justify-center gap-0.5">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M6 5l-3 4 3 4M12 5l3 4-3 4"
              stroke="#FF9933"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Edge labels */}
      <div className="absolute bottom-3 left-3 pointer-events-none">
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm font-semibold">
          Before · पहले
        </span>
      </div>
      <div className="absolute bottom-3 right-3 pointer-events-none">
        <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-lg backdrop-blur-sm font-semibold">
          After · बाद में
        </span>
      </div>
    </div>
  );
}
