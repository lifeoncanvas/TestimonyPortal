import "./styles.css";

function ProfileHeader({ name, avatar, bio, testimonyCount }) {
  return (
    <div className="profile-header">
      <img src={avatar || "https://i.pravatar.cc/100"} alt={name} className="profile-avatar" />
      <h2>{name}</h2>
      {bio && <p className="profile-bio">{bio}</p>}
      <span className="testimony-count">{testimonyCount || 0} Testimonies</span>
    </div>
  );
}

export default ProfileHeader;
