import Image from "next/image";
import { FadeInSection } from "../FadeInSection";

export default function FundraisingHeroImage() {
  return (
    <FadeInSection className="w-full">
      <div className="relative aspect-[3/3] rounded-2xl overflow-hidden shadow-xl">
        <Image src="/fundraising-img-1.svg" alt="Fundraiser in action" fill className="object-cover" />
      </div>
    </FadeInSection>
  );
}
