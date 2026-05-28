import React from 'react';
import Card from './Card';
import Button from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <Card className="relative z-10 w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-700/50">
        <div className="flex justify-between items-center mb-4 border-b border-[var(--border-color)] pb-3">
          <h3 className="text-xl font-bold text-[var(--text-primary)]">{title}</h3>
          <button 
            onClick={onClose} 
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors text-2xl leading-none"
          >
            &times;
          </button>
        </div>
        <div className="mb-6 text-[var(--text-secondary)]">
          {children}
        </div>
        <div className="flex justify-end">
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Modal;
