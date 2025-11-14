import Image from "next/image";
import Link from "next/link";

const involvedLinks = [
  { label: "Start a Fundraiser", href: "/start" },
  { label: "Set up a NGO", href: "/ngos" },
  { label: "Donate crypto to Water Project", href: "/donate" },
];
const aboutLinks = [
  { label: "Our Work", href: "/our-work" },
  { label: "See our Financials", href: "/financials" },
  { label: "Careers", href: "/careers" },
  { label: "Meet the Team", href: "/team" },
];
const rightLinks = [
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
];
const socials = [
  { icon: "/instagram.svg", label: "Instagram", href: "#" },
  { icon: "/x.svg", label: "X", href: "#" },
  { icon: "/facebook.svg", label: "Facebook", href: "#" },
];

export default function Footer() {
  return (
    <div className="bg-[rgba(11,34,48,0.92)] text-[#fffdfa] text-sm pt-10 pb-6 px-4 mt-12 backdrop-blur">
      <div className="max-w-7xl mx-auto w-full">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-10 md:gap-6">
          {/* Logo and Contact */}
          <div className="flex flex-col items-start gap-3 min-w-[190px]">
            <Image src="/logo.svg" alt="AquaFund Logo" width={120} height={40} className="mb-1" />
            <span className="text-xs">Based in Adelaide, Australia</span>
            <span className="text-xs">Reach us: <Link href="mailto:support@aquafund.com" className="underline">support@aquafund.com</Link></span>
          </div>
          {/* Get Involved */}
          <div className="flex flex-col min-w-[160px]">
            <span className="font-semibold mb-2">Get Involved</span>
            {involvedLinks.map(link => (
              <Link key={link.label} href={link.href} className="hover:underline mb-1">{link.label}</Link>
            ))}
          </div>
          {/* About Us */}
          <div className="flex flex-col min-w-[160px]">
            <span className="font-semibold mb-2">About Us</span>
            {aboutLinks.map(link => (
              <Link key={link.label} href={link.href} className="hover:underline mb-1">{link.label}</Link>
            ))}
          </div>
          {/* Right Links */}
          <div className="flex flex-col min-w-[140px] items-end text-end">
            {rightLinks.map(link => (
              <Link key={link.label} href={link.href} className="hover:underline mb-1">{link.label}</Link>
            ))}
          </div>
        </div>
        {/* Divider */}
        <div className="my-6 border-t border-[#CAC4D0]" />
        {/* Bottom Row */}
        <div className="flex flex-col gap-5 md:gap-1 items-center text-xs">
          <span className="mb-2 text-center">100% of public donations go directly to fund clean water projects</span>
          <div className="flex gap-5 mb-2">
            {socials.map(s => (
              <Link key={s.label} href={s.href} aria-label={s.label} className="inline-block">
                <Image src={s.icon} alt={s.label} width={22} height={22} />
              </Link>
            ))}
          </div>
          <span className="font-light">©{new Date().getFullYear()} AquaFund. All rights reserved.</span>
        </div>
      </div>
    </div>
  );
}
