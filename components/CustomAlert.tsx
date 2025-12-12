import React from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type AlertType = "success" | "error" | "warning" | "info";

interface CustomAlertProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: AlertType;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
}

const CustomAlert: React.FC<CustomAlertProps> = ({ isOpen, onClose, title, message, type = "info", onConfirm, confirmText = "OK", cancelText = "Cancel" }) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle size={48} className="text-green-500" />;
      case "error":
        return <AlertCircle size={48} className="text-red-500" />;
      case "warning":
        return <AlertTriangle size={48} className="text-orange-500" />;
      case "info":
      default:
        return <Info size={48} className="text-blue-500" />;
    }
  };

  const getButtonColor = () => {
    switch (type) {
      case "success":
        return "bg-green-600 hover:bg-green-700 focus:ring-green-500";
      case "error":
        return "bg-red-600 hover:bg-red-700 focus:ring-red-500";
      case "warning":
        return "bg-orange-600 hover:bg-orange-700 focus:ring-orange-500";
      case "info":
      default:
        return "bg-violet-600 hover:bg-violet-700 focus:ring-violet-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 min-h-screen">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose}></div>

      {/* Modal Content */}
      <div className="relative bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-fade-in-up">
        <div className="p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-gray-100 dark:bg-white/5 rounded-full">{getIcon()}</div>
          </div>

          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{title}</h3>

          <p className="text-gray-500 dark:text-gray-300 mb-6 text-sm">{message}</p>

          <div className={`flex gap-3 justify-center ${onConfirm ? "" : "w-full"}`}>
            {onConfirm && (
              <button
                onClick={onClose}
                className="flex-1 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-white/5 dark:hover:bg-white/10 dark:text-gray-300 rounded-xl font-medium transition-colors"
              >
                {cancelText}
              </button>
            )}

            <button
              onClick={() => {
                if (onConfirm) onConfirm();
                onClose();
              }}
              className={`${
                onConfirm ? "flex-1" : "w-full"
              } px-5 py-2.5 text-white rounded-xl font-medium shadow-lg shadow-gray-200/50 dark:shadow-none transition-all transform active:scale-95 ${getButtonColor()}`}
            >
              {confirmText}
            </button>
          </div>
        </div>

        {/* Close button (optional, maybe not needed if we have Cancel) */}
        {!onConfirm && (
          <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>
    </div>
  );
};

export default CustomAlert;
