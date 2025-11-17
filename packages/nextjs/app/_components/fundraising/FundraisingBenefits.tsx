import Image from "next/image";

const benefits = [
  {
    icon: "/notifications.svg",
    title: "Easy",
    desc: "Donate easily and faster",
  },
  {
    icon: "/blockchain.svg",
    title: "Decentralized",
    desc: "Use any crypto wallet",
  },
  {
    icon: "/transparent.svg",
    title: "Transparent",
    desc: "See real-time updates",
  },
];

export default function FundraisingBenefits() {
  return (
    <section className="py-16 ">
      <div className="container mx-auto gap-6">
        <h3 className="text-start text-[22px] md:text-2xl font-medium text-[#001627] mb-6">
          AquaFund makes water fundraisers effortless, trustless, and crystal-clear.
        </h3>
        <div className="flex flex-col md:flex-row m-auto justify-center gap-4 w-full max-w-5xl">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="flex gap-4 text-start items-center px-6   justify-center  align-middle bg-[#FFFDFA24] border border-[#CAC4D0] rounded-xl min-w-[220px] min-h-[102px]"
            >

              <div className="mb-2 flex items-center">
                <Image src={b.icon} alt={b.title} width={42} height={42} />
              </div>

                <div className="flex flex-col w-full justify-between items-start">
              <span className="font-semibold text-lg text-[#001627] mb-1">{b.title}</span>
              <span className="text-sm text-[#475068] text-start">{b.desc}</span>
                </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
