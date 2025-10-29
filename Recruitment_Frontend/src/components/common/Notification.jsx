import { useState, useEffect } from 'react';
import { CheckCircle, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

/**
 * Notification Component
 * - Hiển thị thông báo với auto-dismiss sau 3 giây
 * - Có nút X để đóng thủ công
 * - Hỗ trợ nhiều loại: success, error, info, warning
 */

const Notification = ({ 
  type = 'success', 
  message, 
  isVisible, 
  onClose, 
  autoHide = true, 
  duration = 3000 
}) => {
  const [show, setShow] = useState(isVisible);

  // Auto hide sau duration
  useEffect(() => {
    if (isVisible && autoHide) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, autoHide, duration]);

  // Sync với prop isVisible
  useEffect(() => {
    setShow(isVisible);
  }, [isVisible]);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => {
      onClose();
    }, 300); // Cho animation fade out
  };

  if (!show) return null;

  // Icon theo type
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-green-600" size={20} />;
      case 'error':
        return <AlertCircle className="text-red-600" size={20} />;
      case 'warning':
        return <AlertTriangle className="text-yellow-600" size={20} />;
      case 'info':
        return <Info className="text-blue-600" size={20} />;
      default:
        return <CheckCircle className="text-green-600" size={20} />;
    }
  };

  // Style theo type
  const getStyles = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800';
      default:
        return 'bg-green-50 border-green-200 text-green-800';
    }
  };

  return (
    <div className={`
      transition-all duration-300 ease-in-out transform
      ${show ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'}
    `}>
      <div className={`
        flex items-center gap-3 p-4 rounded-lg border shadow-lg min-w-[320px] max-w-[400px]
        ${getStyles()}
      `}>
        {/* Icon */}
        {getIcon()}
        
        {/* Message */}
        <p className="flex-1 font-medium text-sm">
          {message}
        </p>
        
        {/* Close button */}
        <button
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default Notification;