import React from 'react';

export default function PageHeader({ title, description, badge }) {
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1.5 mb-1">
        <h1 className="text-3xl font-bold tracking-tight text-default-900">{title}</h1>
        {badge && (
          <span className="px-2 py-1 text-xs font-bold uppercase rounded bg-odc-orange/10 text-odc-orange border border-odc-orange/20">
            {badge}
          </span>
        )}
      </div>
      {description && <p className="text-gray-500 max-w-2xl">{description}</p>}
    </div>
  );
}
