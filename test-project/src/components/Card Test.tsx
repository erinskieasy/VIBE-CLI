// vibe-source: https://app.base44.com/api/apps/687c574f2fee44ff01919f93/entities/Component/687d9e07daec5a0141c79229
// component: Card Test
// category: cards

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const cards = [
  {
    id: 1,
    content: "🌟 Component 1: You’re glowing, Erinski!",
  },
  {
    id: 2,
    content: "🔥 Component 2: This one’s got some serious vibe.",
  },
  {
    id: 3,
    content: "💡 Component 3: Clever, clean, and ready to ship.",
  },
];

export default function VerticalSwiper() {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const swipeTo = (dir: number) => {
    if (index + dir >= 0 && index + dir < cards.length) {
      setDirection(dir);
      setIndex(index + dir);
    }
  };

  return (
    <div className="relative w-full h-[500px] flex items-center justify-center overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={cards[index].id}
          custom={direction}
          initial={{ y: direction > 0 ? 300 : -300, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: direction > 0 ? -300 : 300, opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute w-80 h-96 bg-white shadow-xl rounded-2xl p-6 flex items-center justify-center text-center text-xl font-semibold"
        >
          {cards[index].content}
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-6 flex gap-4">
        <button
          onClick={() => swipeTo(-1)}
          disabled={index === 0}
          className="bg-gray-200 px-4 py-2 rounded-lg text-sm"
        >
          ⬆️ Previous
        </button>
        <button
          onClick={() => swipeTo(1)}
          disabled={index === cards.length - 1}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm"
        >
          ⬇️ Next
        </button>
      </div>
    </div>
  );
}