import Image from "next/image";
import { FadeInSection } from "./FadeInSection";

export default function TiltedBadge() {
  return (
    <FadeInSection className="inline-block" style={{ transform: "rotate(15deg)" }}>
      <div
        className="inline-flex items-center gap-2 text-[#0350B5] rounded-full p-2 border border-[#0350B5] bg-[#6BEBFF33] px-4 py-1 text-xs font-semibold shadow-center"
        
      >
        <Image src="/decentralized.svg" alt="Decentralized" height={20} width={20} />
        <span>Decentralized</span>
      </div>
    </FadeInSection>
  );
}