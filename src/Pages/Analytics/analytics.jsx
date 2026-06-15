import "./styles.css";
import AnalyticsCard from "../../Sections/AnalyticsCard/AnalyticsCard";
import BottomNav from "../../Sections/BottomNav/BottomNav";

export default function Analytics() {
  return (
    <div className="analytics-page">
      <h2>Analytics</h2>
      <div className="analytics-grid">
        <AnalyticsCard label="Total Views" value="1,240" icon="👁️" />
        <AnalyticsCard label="Prayers" value="87" icon="🙏" />
        <AnalyticsCard label="Saves" value="34" icon="🔖" />
        <AnalyticsCard label="Testimonies" value="5" icon="📖" />
      </div>
      <BottomNav />
    </div>
  );
}
