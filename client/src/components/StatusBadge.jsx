import React from 'react';

const dots = {
  planning: '●',
  'in-progress': '●',
  review: '●',
  completed: '●',
  'on-hold': '●',
};

export default function StatusBadge({ status }) {
  return (
    <span className={`badge badge-${status}`}>
      {dots[status]} {status.replace('-', ' ')}
    </span>
  );
}
