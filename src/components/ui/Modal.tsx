"use client";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";

type Props = {
  isOpen?: boolean;
  open?: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidthClass?: string;
  title?: string;
  closeOnBackdrop?: boolean;
  closeOnEsc?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  className?: string;
};

export default function Modal({
  isOpen,
  open,
  onClose,
  children,
  maxWidthClass = "md:max-w-4xl lg:max-w-5xl",
  title,
  closeOnBackdrop = true,
  closeOnEsc = true,
  initialFocusRef,
  restoreFocus = true,
  className,
}: Props) {
  const shown = open ?? isOpen ?? false;

  const cardRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedEl = useRef<HTMLElement | null>(null);
  const titleId = useRef(`modal-title-${Math.random().toString(36).slice(2)}`);
  const [entered, setEntered] = useState(false);

  // Lock scroll + Esc handler + focus trap
  useEffect(() => {
    if (!shown) return;

    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (closeOnEsc && e.key === "Escape") onClose();
      if (e.key === "Tab") {
        const focusable = getFocusable(cardRef.current);
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement as HTMLElement | null;

        if (e.shiftKey && active === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && active === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.documentElement.style.overflow = prevHtmlOverflow || "";
    };
  }, [shown, onClose, closeOnEsc]);

  // Animate in on mount (mobile slide-up)
  useEffect(() => {
    if (!shown) return setEntered(false);
    const t = requestAnimationFrame(() => setEntered(true));
    return () => cancelAnimationFrame(t);
  }, [shown]);

  // Focus management
  useLayoutEffect(() => {
    if (!shown) return;
    previouslyFocusedEl.current = document.activeElement as HTMLElement | null;

    const target =
      initialFocusRef?.current ??
      getFocusable(cardRef.current)[0] ??
      cardRef.current;

    const t = setTimeout(() => target?.focus?.(), 0);
    return () => clearTimeout(t);
  }, [shown, initialFocusRef]);

  // Restore focus when closing
  useEffect(() => {
    if (!shown && restoreFocus && previouslyFocusedEl.current) {
      previouslyFocusedEl.current.focus?.();
      previouslyFocusedEl.current = null;
    }
  }, [shown, restoreFocus]);

  if (!shown) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden
      />

      {/* Bottom sheet on mobile, centered dialog on desktop */}
      <div className="absolute inset-0 flex items-end sm:items-center justify-center">
        <div
          ref={cardRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId.current : undefined}
          tabIndex={-1}
          className={[
            // layout
            "relative w-full sm:w-auto mx-0 sm:mx-6 bg-white",
            "rounded-t-2xl sm:rounded-2xl shadow-2xl ring-1 ring-black/5",
            "max-w-none sm:max-w-md",
            // height & scrolling
            "max-h-[85vh] sm:max-h-[85vh] overflow-y-auto overscroll-contain",
            // slide-up on mobile
            entered ? "translate-y-0" : "translate-y-full",
            "transition-transform duration-300 ease-out sm:translate-y-0",
            maxWidthClass,
            className ?? "",
          ].join(" ")}
          // Safe area padding for iOS home bar compatibility
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
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

          {/* Optional accessible title */}
          {title ? (
            <h2 id={titleId.current} className="sr-only">
              {title}
            </h2>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}

/* utils */
function getFocusable(root: HTMLElement | null) {
  if (!root) return [] as HTMLElement[];
  const selectors = [
    "a[href]",
    "button:not([disabled])",
    "textarea:not([disabled])",
    "input:not([disabled])",
    "select:not([disabled])",
    "[tabindex]:not([tabindex='-1'])",
  ].join(",");
  return Array.from(root.querySelectorAll<HTMLElement>(selectors)).filter(
    (el) => !el.hasAttribute("disabled") && !el.getAttribute("aria-hidden")
  );
}
