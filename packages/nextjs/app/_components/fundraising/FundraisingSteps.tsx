import { FadeInSection } from "../FadeInSection";
import React, { useEffect, useRef, useState } from "react";

const steps = [
  {
    number: 1,
    title: "Start a Fundraiser",
    desc: "Follow the prompts to create your fundraiser and set your goals. You can edit your details anytime.",
  },
  {
    number: 2,
    title: "Connect Your Wallet",
    desc: "Set up and connect the crypto wallet you want to receive donations from your fundraising into.",
  },
  {
    number: 3,
    title: "Reach Your Donors",
    desc: "Reach your donors by sharing the link to your fundraiser. Use your dashboard to track the progress of your fundraising.",
  },
];

export default function FundraisingSteps() {
  // Track which step is active (by scroll or hover)
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Observe which step is in view
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    stepRefs.current.forEach((ref, idx) => {
      if (!ref) return;
      const observer = new window.IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
            setActiveStepIdx(idx);
          }
        },
        { threshold: 0.5 }
      );
      observer.observe(ref);
      observers.push(observer);
    });
    return () => observers.forEach(obs => obs.disconnect());
  }, []);

  return (
    <div className="relative w-full">
      {/* Timeline line - full height except after last card */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-[#E0E7EF] z-0 pointer-events-none" style={{ borderRadius: '2px' }} />
      <FadeInSection className=" w-full flex flex-col gap-16">
        {steps.map((step, idx) => (
          <div
            key={step.number}
            ref={el => { stepRefs.current[idx] = el; }}
            className={`relative flex gap-4 justify-between rounded-2xl shadow-md p-5 border border-[#E0E7EF] items-center transition-colors duration-300 ${
              idx === activeStepIdx ? "bg-[#E1FFFF]" : "bg-white"
            }`}
            onMouseEnter={() => setActiveStepIdx(idx)}
            onMouseLeave={() => setActiveStepIdx(
              // fallback to first that's in view or default (first step)
              stepRefs.current.findIndex(el => {
                if (!el) return false;
                const rect = el.getBoundingClientRect();
                return (
                  rect.top < window.innerHeight / 2 &&
                  rect.bottom > window.innerHeight / 2
                );
              }) || 0
            )}
          >
            <div className="flex flex-col items-center justify-center w-12 z-10">
              <div className="items-center justify-center text-center w-12 h-12 rounded-full border border-[#0350B5] text-black flex items-center justify-center font-bold text-lg ">
                {step.number}
              </div>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-[#001627] mb-1">{step.title}</h3>
              <p className="text-[#475068] text-sm leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </FadeInSection>
    </div>
  );
}
