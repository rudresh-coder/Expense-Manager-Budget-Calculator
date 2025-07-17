import "../CSS/UserProfile.css";

type UserProfileProps = {
  user: {
    name: string;
    email: string;
    username: string;
    avatarUrl?: string;
    banks: { name: string }[];
  };
  open: boolean;
  onClose: () => void;
};

export default function UserProfile({ user, open, onClose }: UserProfileProps) {
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
            <div className="profile-username">@{user.username}</div>
            <div className="profile-email">{user.email}</div>
          </div>
          <div className="profile-banks">
            <b>Banks Connected:</b> {user.banks.length}
            <ul>
              {user.banks.map((bank, i) => (
                <li key={bank.name + i}>{bank.name}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {open && <div className="profile-sidebar-overlay" onClick={onClose} />}
    </>
  );
}