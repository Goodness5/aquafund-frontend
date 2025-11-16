"use client";

import { useState, useEffect } from "react";
import { FadeInSection } from "../FadeInSection";

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  period: string;
  bgColor: string;
  additionalValue?: string;
  index: number;
}

function MetricCard({ title, value, change, changeType, period, bgColor, additionalValue, index }: MetricCardProps) {
  const [animatedValue, setAnimatedValue] = useState("0.00");

  const changeColor = 
    changeType === "positive" ? "text-[#00BF3C]" :
    changeType === "negative" ? "text-[#FF5A5F]" :
    "text-[#475068]";

  useEffect(() => {
    // Animate value counting up
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue > 0) {
      const duration = 1000;
      const steps = 60;
      const increment = numValue / steps;
      let current = 0;
      const interval = setInterval(() => {
        current += increment;
        if (current >= numValue) {
          setAnimatedValue(value);
          clearInterval(interval);
        } else {
          setAnimatedValue(current.toFixed(2));
        }
      }, duration / steps);
      return () => clearInterval(interval);
    } else {
      setAnimatedValue(value);
    }
  }, [value]);

  return (
    <FadeInSection delay={index * 50} className="h-full">
      <div 
        className={`${bgColor} rounded-xl p-4 lg:p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-pointer h-full`}
      >
        <div className="text-xs lg:text-sm text-[#475068] mb-2">{title}</div>
        <div className="text-2xl lg:text-3xl font-bold text-[#001627] mb-2 transition-all duration-300">
          {animatedValue}
        </div>
        <div className="flex items-center gap-2 text-xs lg:text-sm">
          <span className={`${changeColor} transition-colors duration-300`}>{change}</span>
          <span className="text-[#475068]">{period}</span>
        </div>
        {additionalValue && (
          <div className="mt-2 text-xs lg:text-sm text-[#475068]">{additionalValue}</div>
        )}
      </div>
    </FadeInSection>
  );
}

export default function MetricsCards() {
  const metrics = [
    {
      title: "Total Raised",
      value: "0.00",
      change: "+0%",
      changeType: "positive" as const,
      period: "+0% this week",
      bgColor: "bg-[#EDFCF1]",
    },
    {
      title: "Active Fundraisers",
      value: "0.00",
      change: "+10%",
      changeType: "positive" as const,
      period: "+0 this week",
      bgColor: "bg-[#E6F1FD]",
    },
    {
      title: "Total Donors",
      value: "0.00",
      change: "-0%",
      changeType: "negative" as const,
      period: "+0 this week",
      bgColor: "bg-[#EDEEFC]",
    },
    {
      title: "Transparency Score",
      value: "0.00",
      change: "0%",
      changeType: "neutral" as const,
      period: "",
      bgColor: "bg-[#E6FBFD]",
      additionalValue: "0",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 w-full min-w-0">
      {metrics.map((metric, index) => (
        <MetricCard key={metric.title} {...metric} index={index} />
      ))}
    </div>
  );
}

