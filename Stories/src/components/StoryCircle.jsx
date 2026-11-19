import React from 'react';
import PropTypes from 'prop-types';

const StoryCircle = ({ user, newCount, onClick }) => {
  const { login, avatar } = user;
  const safeAvatar =
    avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(login)}`;

  return (
    <div
      className="story-circle"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      <div className={`circle-avatar ${newCount > 0 ? 'new' : 'viewed'}`}>
        <img src={safeAvatar} alt={login} />
        {newCount > 0 && <div className="circle-badge">{newCount}</div>}
      </div>
      <div className="circle-name">{login}</div>
    </div>
  );
};

StoryCircle.propTypes = {
  user: PropTypes.shape({
    login: PropTypes.string.isRequired,
    avatar: PropTypes.string,
  }).isRequired,
  newCount: PropTypes.number.isRequired,
  onClick: PropTypes.func.isRequired,
};

export default StoryCircle;