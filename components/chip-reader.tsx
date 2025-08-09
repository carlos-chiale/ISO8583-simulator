"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard } from "lucide-react";

interface ChipReaderProps {
  onInsert: () => void;
}

export function ChipReader({ onInsert }: ChipReaderProps) {
  const [inserted, setInserted] = useState(false);

  const handleInsert = () => {
    if (!inserted) {
      setInserted(true);
      onInsert();
    }
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="text-center mb-8">
        <h3 className="text-xl font-bold mb-2">Insert Card</h3>
        <p className="text-gray-500">Insert your chip card into the reader</p>
      </div>

      <div className="relative w-[300px] h-[200px]">
        {/* Card reader */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[280px] h-[60px] bg-gray-800 rounded-lg">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[240px] h-[10px] bg-gray-900 rounded-full"></div>
        </div>

        {/* Card */}
        <motion.div
          className="absolute bottom-[50px] left-1/2 transform -translate-x-1/2 w-[240px] h-[150px] bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg cursor-pointer flex flex-col justify-between p-4"
          initial={{ y: 0 }}
          animate={inserted ? { y: 80 } : { y: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          onClick={handleInsert}
          whileHover={!inserted ? { y: 20 } : {}}
        >
          <div className="flex justify-between items-start">
            <div className="w-10 h-8 bg-yellow-300 rounded"></div>
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
        <p>{inserted ? "Card inserted" : "Click the card to insert it"}</p>
      </div>
    </div>
  );
}
