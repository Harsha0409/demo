import React from 'react';

interface CategoryBadgeProps {
  category: string;
  background: string;
  textColor: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, background, textColor, className = '' }) => (
  <div
    className={`px-2 py-1 rounded-lg font-bold text-[10px] sm:text-xs shadow ${textColor} ${className}`}
    style={{ background, boxShadow: '0 2px 8px 0 rgba(255, 215, 0, 0.2)' }}
  >
    {category}
  </div>
);

export default CategoryBadge; 