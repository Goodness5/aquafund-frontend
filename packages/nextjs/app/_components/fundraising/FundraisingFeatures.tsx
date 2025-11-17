import { FadeInSection } from "../FadeInSection";
import Link from "next/link";
import { Button } from "../Button";
import { ArrowUpRightIcon } from "@heroicons/react/24/outline";
import Image from "next/image";

const features = [
  {
    title: "Community Projects",
    desc: "Discover verified water projects worldwide.",
    icon: "/community-projects.svg",
  },
  {
    title: "Crypto Donations",
    desc: "Contribute in ETH, USDC, or your preferred tokens.",
    icon: "/crypto-donations.svg",
  },
  {
    title: "Transparent",
    desc: "Every donation is blockchain verifiable.",
    icon: "/decentralized.svg",
  },
  {
    title: "Impact Badges",
    desc: "Get verifiable proof of your generosity in form of NFTs.",
    icon: "/badges.svg",
  },
  {
    title: "Dashboard",
    desc: "See every step of progress in real time.",
    icon: "/dashboard.svg",
  },
  {
    title: "Smart Contracts",
    desc: "Automated fund releases and ensure projects meet milestones.",
    icon: "/smartcontracts.svg",
  },
];

export default function FundraisingFeatures() {
  return (
    <>
      <FadeInSection className="text-center mb-12">
        <div className="card bg-white border border-[#CAC4D0] rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">

        <p className="text-lg text-[#001627] mb-6 ">
          Fundraising on AquaFund Is easy, decentralized, and transparent.
        </p>
        <Link href="/start">
          <Button rounded="full" className="bg-[#0350B5] text-white hover:bg-[#0350B5] rounded-full cursor-pointer">
            Start An AquaFund
            <ArrowUpRightIcon className="ml-2 h-5 w-5" />
          </Button>
        </Link>
        </div>
      </FadeInSection>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-[70%] m-auto mb-16">
        {features.map((feature, i) => (
          <FadeInSection key={i} delay={i * 50}>
            <div className="border border-[#CAC4D0] rounded-xl gap-6 p-3 h-full shadow-inner transition-shadow min-h-[120px] flex flex-col items-start justify-start w-full">
              <div className="w-9 h-9 rounded-lg  flex items-center justify-center">
                <Image src={feature.icon} alt={feature.title} width={62} height={62} />
              </div>
              <div className="flex flex-col gap-3">

              <h3 className="font-semibold text-black leading-none text-xl mb-0 ">{feature.title}</h3>
              <p className=" text-black leading-none text-sm flex-1">{feature.desc}</p>
              </div>
            </div>
          </FadeInSection>
        ))}
      </div>
    </>
  );
}
