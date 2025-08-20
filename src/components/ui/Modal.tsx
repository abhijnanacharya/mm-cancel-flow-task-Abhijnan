"use client";
import React, { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
};

export default function Modal({
  isOpen,
  onClose,
  children,
  maxWidthClass = "md:max-w-4xl lg:max-w-5xl",
}: Props) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);

    //Lock Scroll
    const prevHtmlOverflow = document.documentElement.style.overflow;
    if (isOpen) document.documentElement.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtmlOverflow || "";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      {/* Cards Container */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className={[
            "relative w-full mx-4 sm:mx-6 bg-white rounded-2xl shadow-2xl ring-1 ring-black/5",
            "max-w-none sm:max-w-md",
            maxWidthClass,
          ].join(" ")}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Btn */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>

          {children}
        </div>
      </div>
    </div>
  );
}
