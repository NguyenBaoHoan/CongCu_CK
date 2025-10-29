import { useNotification } from '../../hooks/useNotification';
import Notification from './Notification';

/**
 * NotificationContainer - Render tất cả notifications
 */

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {notifications.map((notification, index) => (
        <div
          key={notification.id}
          style={{
            transform: `translateY(${index * 10}px)`,
            zIndex: 1000 - index
          }}
        >
          <Notification
            type={notification.type}
            message={notification.message}
            isVisible={true}
            onClose={() => removeNotification(notification.id)}
            autoHide={false} // Đã handle ở context
            duration={notification.duration}
          />
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;