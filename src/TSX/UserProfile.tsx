import "../CSS/UserProfile.css";

type UserProfileProps = {
  user: {
    name: string;
    email: string;
    avatarUrl?: string;
    banks: { name: string }[];
    isPremium?: boolean;
  };
  open: boolean;
  onClose: () => void;
};

export default function UserProfile({ user, open, onClose }: UserProfileProps) {
  function handleLogout() {
    localStorage.clear();
    window.location.href = "/signin";
  }

  return (
    <>
      <div className={`profile-sidebar${open ? " open" : ""}`}>
        <button className="profile-close-btn" onClick={onClose} aria-label="Close profile">&times;</button>
        <div className="profile-content">
          <div className="profile-avatar-large">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt={user.name} />
            ) : (
              <span>{user.name[0]}</span>
            )}
          </div>
          <div className="profile-details">
            <div className="profile-name">{user.name}</div>
            <div className="profile-email">{user.email}</div>
            {user.isPremium && <div className="profile-premium-badge">Premium</div>}
          </div>
          <div className="profile-banks">
            <b>Banks Connected:</b> {user.banks.length}
            <ul>
              {user.banks.map((bank, i) => (
                <li key={bank.name + i}>{bank.name}</li>
              ))}
            </ul>
          </div>
          <button className="profile-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      {open && <div className="profile-sidebar-overlay" onClick={onClose} />}
    </>
  );
}