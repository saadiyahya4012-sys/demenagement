import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface DriverStatCardProps {
  icon: LucideIcon;
  title: string;
  number: string;
  badgeText?: string;
  badgeType?: 'green' | 'blue' | 'neutral';
  index: number;
}

export const DriverStatCard: React.FC<DriverStatCardProps> = ({
  icon: Icon,
  title,
  number,
  badgeText,
  badgeType = 'green',
  index
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
      whileHover={{ y: -3, transition: { duration: 0.2 } }}
      className="p-5 sm:p-6 bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-emerald-200 transition-all flex flex-col justify-between"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mb-1">
            {title}
          </p>
          <p className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
            {number}
          </p>
        </div>

        <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-[#00A86B] flex items-center justify-center shrink-0 shadow-2xs">
          <Icon className="w-6 h-6 stroke-[2]" />
        </div>
      </div>

      {badgeText && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center gap-1.5 text-xs font-bold">
          {badgeType === 'green' && (
            <span className="text-[#00A86B] flex items-center gap-1">
              <span>{badgeText}</span>
            </span>
          )}
          {badgeType === 'blue' && (
            <span className="text-sky-600 flex items-center gap-1">
              <span>{badgeText}</span>
            </span>
          )}
          {badgeType === 'neutral' && (
            <span className="text-slate-500 flex items-center gap-1">
              <span>{badgeText}</span>
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};
