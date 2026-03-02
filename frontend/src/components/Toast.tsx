import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const styleMap: Record<ToastType, { container: string; icon: JSX.Element }> = {
    success: {
      container: 'bg-green-50 border-green-200 text-green-900',
      icon: <CheckCircle className="w-5 h-5 text-green-600" />,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      icon: <AlertCircle className="w-5 h-5 text-red-600" />,
    },
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: <Info className="w-5 h-5 text-blue-600" />,
    },
  };

  const styles = styleMap[type];

  return (
    <div className={`flex items-start gap-3 border rounded-lg shadow-sm p-3 ${styles.container}`}>
      <div className="mt-0.5">{styles.icon}</div>
      <div className="text-sm font-semibold flex-1">{message}</div>
      <button
        type="button"
        onClick={onClose}
        className="text-gray-500 hover:text-gray-700"
        aria-label="Close notification"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
