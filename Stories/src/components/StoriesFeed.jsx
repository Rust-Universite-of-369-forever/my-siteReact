import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { load, STORAGE_KEYS } from '../utils/storage';
import StoryCircle from './StoryCircle';
import StoryForm from './StoryForm';

const StoriesFeed = ({
  currentUser,
  stories,
  onView,
  onAdd,
  onLogout,
  onUsersChanged,
}) => {
  const [tab, setTab] = useState('all');
  const [showForm, setShowForm] = useState(false);

  const users = [...new Set(stories.map((s) => s.userId))];
  const viewed = load(`${STORAGE_KEYS.viewed}_${currentUser || 'guest'}`, []);
  const usersData = load(STORAGE_KEYS.users, []);

  const getUserStories = (uid) => stories.filter((s) => s.userId === uid);

  const visibleUsers =
    tab === 'mine' && currentUser && currentUser !== 'guest'
      ? [currentUser]
      : users;

  const isGuest = currentUser === 'guest';

  const handleAdd = (story) => {
    onAdd(story);
    if (onUsersChanged) onUsersChanged();
  };

  return (
    <div className="feed-wrap">
      <div className="feed-header">
        <h1>Stories</h1>
        <div className="tabs">
          <button
            className={`tab ${tab === 'all' ? 'active' : ''}`}
            onClick={() => setTab('all')}
          >
            Все
          </button>
          <button
            className={`tab ${tab === 'mine' ? 'active' : ''}`}
            onClick={() => setTab('mine')}
            disabled={isGuest}
            title={isGuest ? 'Войдите, чтобы видеть свои истории' : ''}
          >
            Мои
          </button>
        </div>
        <div className="user-info">
          <span>{isGuest ? '👁 Гость' : `👤 ${currentUser}`}</span>

          {!isGuest && (
            <button className="btn-add" onClick={() => setShowForm(true)}>
              + История
            </button>
          )}

          <button className="btn-logout" onClick={onLogout}>
            {isGuest ? 'Войти в аккаунт' : 'Выйти'}
          </button>
        </div>
      </div>

      <div className="stories-row">
        {visibleUsers.length === 0 && (
          <div className="empty">Историй пока нет</div>
        )}
        {visibleUsers.map((uid) => {
          const storiesList = getUserStories(uid);
          const user =
            usersData.find((u) => u.login === uid) || {
              login: uid,
              avatar: `https://i.pravatar.cc/150?u=${uid}`,
            };
          const newCount = storiesList.filter(
            (s) => !viewed.includes(s.id)
          ).length;
          return (
            <StoryCircle
              key={uid}
              user={user}
              newCount={newCount}
              onClick={() => onView(uid)}
            />
          );
        })}
      </div>

      {showForm && !isGuest && (
        <StoryForm
          currentUser={currentUser}
          onClose={() => setShowForm(false)}
          onAdd={handleAdd}
        />
      )}
    </div>
  );
};

StoriesFeed.propTypes = {
  currentUser: PropTypes.string,
  stories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      userId: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      image: PropTypes.string,
      createdAt: PropTypes.number.isRequired,
    })
  ).isRequired,
  onView: PropTypes.func.isRequired,
  onAdd: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired,
  onUsersChanged: PropTypes.func,
};

export default StoriesFeed;