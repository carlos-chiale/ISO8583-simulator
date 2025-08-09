"use client";

import { useState, useRef } from "react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { CreditCard } from "lucide-react";

interface CardSwipeProps {
  onSwipe: () => void;
}

export function CardSwipe({ onSwipe }: CardSwipeProps) {
  const [swiped, setSwiped] = useState(false);
  const constraintsRef = useRef(null);
  const x = useMotionValue(0);
  const opacity = useTransform(x, [-200, 0, 200], [0, 1, 0]);

  const handleDragEnd = (event: any, info: any) => {
    if (Math.abs(info.offset.x) > 100) {
      setSwiped(true);
      onSwipe();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Swipe Card</h3>
        <p className="text-gray-500">Swipe your card through the reader</p>
      </div>

      <div className="relative w-[300px] h-[180px]" ref={constraintsRef}>
        {/* Card reader slot */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[280px] h-[50px] bg-gray-800 rounded-lg flex items-center justify-center">
          <div className="w-[260px] h-[10px] bg-gray-900 rounded-full"></div>
        </div>

        {/* Card */}
        <motion.div
          className="absolute top-[60px] left-1/2 transform -translate-x-1/2 w-[240px] h-[150px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg cursor-grab active:cursor-grabbing flex flex-col justify-between p-4"
          drag="x"
          dragConstraints={constraintsRef}
          dragElastic={0.1}
          style={{ x, opacity }}
          onDragEnd={handleDragEnd}
          whileTap={{ scale: 1.05 }}
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-6 bg-yellow-300 rounded"></div>
            <CreditCard className="h-6 w-6 text-white" />
          </div>
          <div className="space-y-1">
            <div className="w-full h-6 bg-gray-200 bg-opacity-20 rounded"></div>
            <div className="flex justify-between">
              <div className="text-white text-xs">CARD HOLDER</div>
              <div className="text-white text-xs">EXPIRES</div>
            </div>
            <div className="flex justify-between">
              <div className="text-white font-medium">JOHN DOE</div>
              <div className="text-white font-medium">12/25</div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="mt-8 text-center text-gray-500">
        <p>Drag the card to the left or right to swipe</p>
      </div>
    </div>
  );
}
