"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Wifi } from "lucide-react";

interface ContactlessReaderProps {
  onTap: () => void;
}

export function ContactlessReader({ onTap }: ContactlessReaderProps) {
  const [tapped, setTapped] = useState(false);
  const [showWaves, setShowWaves] = useState(false);

  const handleTap = () => {
    if (!tapped) {
      setTapped(true);
      setShowWaves(true);

      setTimeout(() => {
        setShowWaves(false);
        onTap();
      }, 1000);
    }
  };

  const waveVariants = {
    animate: (i: number) => ({
      opacity: [0, 1, 0],
      scale: [1, 1.5, 2],
      transition: {
        duration: 1.5,
        delay: i * 0.2,
        repeat: 0,
      },
    }),
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Tap Card</h3>
        <p className="text-gray-500">Tap your contactless card on the reader</p>
      </div>

      <div className="relative w-[300px] h-[200px]">
        {/* Contactless reader */}
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120px] h-[120px] bg-gray-800 rounded-lg flex items-center justify-center">
          <Wifi className="h-12 w-12 text-gray-400" />

          {/* Contactless waves */}
          {showWaves && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 border-2 border-blue-500 rounded-lg"
                  custom={i}
                  variants={waveVariants}
                  animate="animate"
                />
              ))}
            </>
          )}
        </div>

        {/* Card */}
        <motion.div
          className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[240px] h-[150px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg cursor-pointer flex flex-col justify-between p-4"
          initial={{ y: 0 }}
          animate={tapped ? { y: -60, x: 0 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={handleTap}
          whileHover={!tapped ? { y: -20 } : {}}
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-8 bg-yellow-300 rounded"></div>
            <div className="flex items-center">
              <Wifi className="h-5 w-5 text-white mr-1" />
              <CreditCard className="h-6 w-6 text-white" />
            </div>
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
        <p>{tapped ? "Card tapped" : "Click the card to tap it"}</p>
      </div>
    </div>
  );
}
