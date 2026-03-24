import React from 'react';

export const SkeletonRow: React.FC = () => {
  return (
    <tr className="wecare-skeleton-row">
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--text" />
      </td>
      <td>
        <div className="wecare-skeleton wecare-skeleton--actions">
          <div className="wecare-skeleton wecare-skeleton--button" />
          <div className="wecare-skeleton wecare-skeleton--button" />
        </div>
      </td>
    </tr>
  );
};
