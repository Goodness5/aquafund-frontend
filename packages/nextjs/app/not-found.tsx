"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HomeIcon, ArrowLeftIcon, FaceFrownIcon } from "@heroicons/react/24/outline";

// Pre-defined positions and sizes to avoid hydration issues
const backgroundElements = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  size: 50 + (i * 7) % 100,
  left: (i * 13) % 100,
  top: (i * 17) % 100,
  color: i % 3 === 0 ? "#0350B5" : i % 3 === 1 ? "#00BF3C" : "#5EE7FF",
  duration: 5 + (i * 2) % 10,
  delay: (i * 0.3) % 5,
}));

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#E1FFFF] via-white to-[#CFFED914] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {backgroundElements.map((element) => (
          <div
            key={element.id}
            className="absolute rounded-full opacity-20"
            style={{
              width: `${element.size}px`,
              height: `${element.size}px`,
              left: `${element.left}%`,
              top: `${element.top}%`,
              background: element.color,
              animation: `float ${element.duration}s ease-in-out infinite`,
              animationDelay: `${element.delay}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto">
        {/* Animated 404 Number */}
        <div className="mb-8">
          <h1
            className={`text-9xl lg:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#0350B5] via-[#00BF3C] to-[#5EE7FF] mb-4 ${
              mounted ? "animate-bounce-in" : "opacity-0"
            }`}
            style={{
              textShadow: "0 0 40px rgba(3, 80, 181, 0.3)",
              animation: mounted ? "bounceIn 1s ease-out, float 3s ease-in-out infinite 1s" : "none",
            }}
          >
            404
          </h1>
        </div>

        {/* Animated Emoji */}
        <div
          className={`mb-6 ${mounted ? "animate-rotate-bounce" : "opacity-0"}`}
          style={{
            animation: mounted
              ? "rotateBounce 2s ease-in-out infinite, fadeInUp 0.8s ease-out 0.3s both"
              : "none",
          }}
        >
          <FaceFrownIcon className="w-24 h-24 lg:w-32 lg:h-32 mx-auto text-[#0350B5] opacity-80" />
        </div>

        {/* Main Message */}
        <div
          className={`mb-8 ${mounted ? "animate-fade-in-up" : "opacity-0"}`}
          style={{
            animation: mounted ? "fadeInUp 0.8s ease-out 0.5s both" : "none",
          }}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-[#001627] mb-4">
            Oops! This page doesn&apos;t exist
          </h2>
          <p className="text-lg lg:text-xl text-[#475068] mb-2">
            We&apos;re working on that, sorry!
          </p>
          <p className="text-base text-[#475068]/80">
            The page you&apos;re looking for might have been moved or doesn&apos;t exist yet.
          </p>
        </div>

        {/* Animated Buttons */}
        <div
          className={`flex flex-col sm:flex-row gap-4 justify-center items-center ${
            mounted ? "animate-fade-in-up" : "opacity-0"
          }`}
          style={{
            animation: mounted ? "fadeInUp 0.8s ease-out 0.7s both" : "none",
          }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 px-6 py-3 bg-[#0350B5] text-white rounded-full font-semibold hover:bg-[#034093] transition-all duration-300 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
          >
            <HomeIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="group flex items-center gap-2 px-6 py-3 bg-white text-[#0350B5] border-2 border-[#0350B5] rounded-full font-semibold hover:bg-[#E1FFFF] transition-all duration-300 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
          >
            <ArrowLeftIcon className="w-5 h-5 transition-transform duration-300 group-hover:-translate-x-1" />
            Go Back
          </button>
        </div>

        {/* Fun Animated Text */}
        <div
          className={`mt-12 ${mounted ? "animate-fade-in" : "opacity-0"}`}
          style={{
            animation: mounted ? "fadeIn 1s ease-out 1s both" : "none",
          }}
        >
          <p className="text-sm text-[#475068]/60">
            Meanwhile, why not explore our amazing projects? 💧
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes bounceIn {
          0% {
            transform: scale(0.3) rotate(-10deg);
            opacity: 0;
          }
          50% {
            transform: scale(1.1) rotate(5deg);
          }
          70% {
            transform: scale(0.9) rotate(-2deg);
          }
          100% {
            transform: scale(1) rotate(0deg);
            opacity: 1;
          }
        }

        @keyframes rotateBounce {
          0%, 100% {
            transform: rotate(0deg) scale(1);
          }
          25% {
            transform: rotate(-10deg) scale(1.1);
          }
          50% {
            transform: rotate(0deg) scale(1);
          }
          75% {
            transform: rotate(10deg) scale(1.1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-30px) translateX(20px);
          }
          66% {
            transform: translateY(30px) translateX(-20px);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-bounce-in {
          animation: bounceIn 1s ease-out;
        }

        .animate-rotate-bounce {
          animation: rotateBounce 2s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.8s ease-out both;
        }

        .animate-fade-in {
          animation: fadeIn 1s ease-out both;
        }
      `}</style>
    </div>
  );
}
