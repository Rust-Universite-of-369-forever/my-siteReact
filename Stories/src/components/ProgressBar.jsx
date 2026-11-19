import React from 'react';
import PropTypes from 'prop-types';

const ProgressBar = ({ total, current, paused, duration = 10000 }) => (
  <div
    className="progress-row"
    style={{ '--story-duration': `${duration}ms` }}
  >
    {Array.from({ length: total }).map((_, i) => {
      let cls = '';
      if (i < current) cls = 'done';
      else if (i === current) cls = 'active';
      return (
        <div
          key={i}
          className={`progress-seg ${cls}${i === current && paused ? ' paused' : ''}`}
        >
          <div className="fill" />
        </div>
      );
    })}
  </div>
);

ProgressBar.propTypes = {
  total: PropTypes.number.isRequired,
  current: PropTypes.number.isRequired,
  paused: PropTypes.bool.isRequired,
  duration: PropTypes.number,
};

export default ProgressBar;