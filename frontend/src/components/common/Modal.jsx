import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Global Portal Modal Component
 * Mounts directly into document.body to prevent sidebar clipping,
 * overflow traps, or partial backdrop dimming.
 */
export default function Modal({
  isOpen,
  onClose,
  title,
  icon: Icon,
  maxWidth = 'max-w-3xl',
  children,
}) {
  useEffect(() => {
    if (!isOpen) return;

    // Prevent background scrolling while modal is open
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // Close on Escape key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] w-screen h-screen flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* 100% Viewport Dark Backdrop */}
      <div
        className="fixed inset-0 w-full h-full bg-black/85 backdrop-blur-md transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <div
        className={`relative z-[101] w-full ${maxWidth} bg-[#12161F] border border-[#2A3245] rounded-2xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200`}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2A3245] flex items-center justify-between bg-[#151922]">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-[#E10600]/15 text-[#E10600] border border-[#E10600]/30">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold uppercase tracking-wider text-white">
                {title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#94A3B8] hover:text-white rounded-lg hover:bg-[#1C2230] border border-transparent hover:border-[#2A3245] transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
