"use client";

import { useState, useRef, useEffect } from "react";
import { CalendarIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

const dateRanges = [
  "Last 7 Days",
  "Last 30 Days",
  "Last 90 Days",
  "Last 6 Months",
  "Last Year",
  "All Time",
];

interface DateRangeDropdownProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DateRangeDropdown({ value, onChange, className = "" }: DateRangeDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 lg:px-4 py-2 border border-[#CAC4D0] rounded-lg text-[#001627] hover:bg-[#F5F5F5] transition-all duration-200 text-sm"
      >
        <CalendarIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{value}</span>
        <span className="sm:hidden">7D</span>
        <ChevronDownIcon
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 bg-white border border-[#CAC4D0] rounded-lg shadow-lg z-50 min-w-[160px] overflow-hidden"
          style={{
            animation: "fadeInUp 0.2s ease-out"
          }}
        >
          {dateRanges.map((range, index) => (
            <button
              key={range}
              onClick={() => {
                onChange(range);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-all duration-200 ${
                value === range
                  ? "bg-[#E1FFFF] text-[#0350B5] font-semibold"
                  : "text-[#001627] hover:bg-[#F5F5F5]"
              }`}
              style={{
                animation: `fadeIn 0.2s ease-out ${index * 0.03}s both`
              }}
            >
              {range}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

