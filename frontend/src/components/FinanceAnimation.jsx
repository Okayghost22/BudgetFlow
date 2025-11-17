// src/components/FinanceAnimation.jsx
import { motion } from 'framer-motion';

const coins = [
  '#ffd700', '#ffd700', '#ffe066', '#ffc300', '#ffd700'
];

export default function FinanceAnimation() {
  return (
    <div className="flex items-end justify-center gap-2 mb-5">
      {coins.map((color, i) => (
        <motion.svg
          key={i}
          width="36" height="36"
          viewBox="0 0 32 32"
          initial={{ scaleY: 0.7 }}
          animate={{ scaleY: [0.7, 1.15, 1] }}
          transition={{ duration: 0.7 + i * 0.2, delay: i * 0.18, repeat: Infinity, repeatType: 'loop' }}
          style={{ margin: '0 4px' }}
        >
          <ellipse cx="16" cy="26" rx="13" ry="6" fill={color} opacity="0.7" />
          <ellipse cx="16" cy="14" rx="13" ry="12" fill={color} />
        </motion.svg>
      ))}
    </div>
  );
}
