import "./styles.css";
import UploadStepper from "./UploadStepper";
import BottomNav from "../../Sections/BottomNav/BottomNav";

export default function UploadTestimony() {
  return (
    <div className="upload-testimony-page">
    
      <UploadStepper onSubmit={() => alert("Submitted!")} />
      <BottomNav />
    </div>
  );
}
