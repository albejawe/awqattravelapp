import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface NotificationProps {
  message: string;
  show: boolean;
  onHide: () => void;
}

const Notification = ({ message, show, onHide }: NotificationProps) => {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onHide();
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [show, onHide]);

  if (!show) return null;

  return (
    <div className="fixed top-20 left-4 z-50 animate-slide-in-from-top" dir="rtl">
      <div className="notification-toast px-6 py-4 flex items-center space-x-3 max-w-sm" style={{ direction: 'rtl' }}>
        <div className="bg-white/20 rounded-full p-1">
          <Check className="h-4 w-4" />
        </div>
        <span className="font-medium font-arabic">{message}</span>
      </div>
    </div>
  );
};

export default Notification;