import "./styles.css";

function NotificationCard({ message, time, read }) {
  return (
    <div className={`notification-card ${read ? "read" : "unread"}`}>
      <div className="notif-dot" />
      <div className="notif-content">
        <p>{message}</p>
        <span>{time}</span>
      </div>
    </div>
  );
}

export default NotificationCard;
