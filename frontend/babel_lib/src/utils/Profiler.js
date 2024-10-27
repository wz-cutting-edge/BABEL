import React from 'react';
import { updateDoc } from 'firebase/firestore';
import { Button, ErrorMessage } from '../components/common';

export const onRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`Component ${id} took ${actualDuration}ms to render`);
  }
};

export const ProfiledComponent = ({ id, children }) => (
  <React.Profiler id={id} onRender={onRenderCallback}>
    {children}
  </React.Profiler>
);
