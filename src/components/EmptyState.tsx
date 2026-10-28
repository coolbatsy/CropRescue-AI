import React from 'react';
import { LucideIcon, Sprout } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Sprout,
  title,
  description,
  actionText,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm my-4">
      <div className="w-14 h-14 rounded-2xl bg-[#F7F9F4] flex items-center justify-center text-[#166534] mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-semibold text-[#17251C] mb-2">{title}</h3>
      <p className="text-sm text-[#647067] max-w-md mb-6">{description}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-[#166534] hover:bg-[#14532D] text-white text-sm font-medium rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-[#22C55E]/40"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};
