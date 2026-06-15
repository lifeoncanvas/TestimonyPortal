import "./styles.css";

function AnalyticsCard({ label, value, icon }) {
  return (
    <div className="analytics-card">
      <span className="analytics-icon">{icon}</span>
      <div>
        <p className="analytics-value">{value}</p>
        <p className="analytics-label">{label}</p>
      </div>
    </div>
  );
}

export default AnalyticsCard;
