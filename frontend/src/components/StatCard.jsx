// src/components/StatCard.jsx
import { motion } from 'framer-motion';

const StatCard = ({ title, used = 0, limit = 0, icon, color }) => {
  // Calculate percent spent, clamp to max 100%
  const percent = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const isOver = used > limit;

  // Progress bar color changes if over budget
  const progressBarColor = isOver ? '#ef4444' : color || '#14b8a6';
  const barBg = isOver ? '#f1c8c8' : '#f0fdfa';

  return (
    <motion.div
      className="card flex flex-col items-start justify-between m-2"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ borderLeft: `6px solid ${progressBarColor}` }}
    >
      <div className="flex items-center space-x-2">
        <span className="text-2xl" style={{ color: progressBarColor }}>{icon}</span>
        <span className="font-semibold text-lg">{title}</span>
      </div>
      <div className="mt-2 text-xl font-bold" style={{ color: progressBarColor }}>
        ₹{used} / ₹{limit}
        {isOver && <span className="ml-2 text-sm font-semibold text-red-600">Over budget!</span>}
      </div>
      <div className="w-full h-3 mt-2 bg-gray-100 rounded" style={{ backgroundColor: barBg }}>
        <div
          className="h-3 rounded"
          style={{ width: `${percent}%`, backgroundColor: progressBarColor }}
        />
      </div>
      <div className="mt-1 text-xs text-gray-500">{percent}% spent</div>
    </motion.div>
  );
};

export default StatCard;
