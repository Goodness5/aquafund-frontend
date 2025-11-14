import TiltedBadge from "../tiltbadge";
import { FadeInSection } from "../FadeInSection";

export default function FundraisingHeader() {
  return (
    <FadeInSection className="text-center mb-12">
      <div className="flex items-center justify-center gap-2 mb-4">
        <TiltedBadge text="Fundraising" imageurl="/fundraising.svg" />
      </div>
      <h2 className="text-3xl md:text-5xl font-bold text-[#001627] mb-4">
        Raising Funds on <br/>AquaFund is Easy
      </h2>
    </FadeInSection>
  );
}
