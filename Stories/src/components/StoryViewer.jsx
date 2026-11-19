import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { load, save, STORAGE_KEYS } from '../utils/storage';
import ProgressBar from './ProgressBar';

const STORY_DURATION = 10000;

const StoryViewer = ({
  stories,
  users,
  initialIndex,
  onClose,
  currentUser,
}) => {
  const [index, setIndex] = useState(initialIndex);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const story = stories[index];

  const author = users.find((u) => u.login === story.userId) || {
    login: story.userId,
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
      story.userId
    )}&background=random&color=fff&size=150`,
  };

  const viewedKey = `${STORAGE_KEYS.viewed}_${currentUser || 'guest'}`;

  useEffect(() => {
    const viewed = load(viewedKey, []);
    if (!viewed.includes(story.id)) {
      save(viewedKey, [...viewed, story.id]);
    }
  }, [story.id, viewedKey]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setTimeout(() => {
      if (index < stories.length - 1) setIndex(index + 1);
      else onClose();
    }, STORY_DURATION);
    return () => clearTimeout(timerRef.current);
  }, [index, paused, stories.length, onClose]);

  const next = useCallback(() => {
    setPaused(false);
    if (index < stories.length - 1) setIndex(index + 1);
    else onClose();
  }, [index, stories.length, onClose]);

  const prev = useCallback(() => {
    setPaused(false);
    if (index > 0) setIndex(index - 1);
  }, [index]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, onClose]);

  const time = new Date(story.createdAt).toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="viewer">
      <div className="viewer-top">
        <img
          className="viewer-avatar"
          src={author.avatar}
          alt={author.login}
        />
        <span className="viewer-user">{author.login}</span>
        <span className="viewer-time">{time}</span>
        <button
          className="viewer-close"
          onClick={onClose}
          aria-label="Закрыть"
        >
          ✕
        </button>
      </div>

      <ProgressBar
        total={stories.length}
        current={index}
        paused={paused}
        duration={STORY_DURATION}
      />

      <div className="viewer-body">
        <div
          className="viewer-content"
          onMouseDown={() => setPaused(true)}
          onMouseUp={() => setPaused(false)}
          onMouseLeave={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
        >
          {story.image && <img src={story.image} alt={story.title} />}
          <h2>{story.title}</h2>
          <p>{story.text}</p>
        </div>
        <div className="viewer-nav prev" onClick={prev} aria-label="Предыдущая" />
        <div className="viewer-nav next" onClick={next} aria-label="Следующая" />
      </div>

      <div className="viewer-footer">
        {index + 1} / {stories.length} · удерживайте для паузы · ← → · Esc
      </div>
    </div>
  );
};

StoryViewer.propTypes = {
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
  users: PropTypes.arrayOf(
    PropTypes.shape({
      login: PropTypes.string.isRequired,
      avatar: PropTypes.string,
    })
  ).isRequired,
  initialIndex: PropTypes.number.isRequired,
  onClose: PropTypes.func.isRequired,
  currentUser: PropTypes.string,
};

export default StoryViewer;