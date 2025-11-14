import Image from "next/image";
import Link from "next/link";
import { FadeInSection } from "~~/app/_components/FadeInSection";

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
  { 
    label: "Instagram", 
    href: "https://instagram.com/aquafund",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
      </svg>
    )
  },
  { 
    label: "X (Twitter)", 
    href: "https://x.com/aquafund",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    )
  },
  { 
    label: "Facebook", 
    href: "https://facebook.com/aquafund",
    icon: (
      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
      </svg>
    )
  },
];

export default function Footer() {
  return (


    

    <FadeInSection>
    <footer className="footer-bg-box text-[#fffdfa] text-sm px-16 pt-10 pb-6 mt-12">
      <div className="mx-auto w-full">
        {/* Main Row */}
        <div className="flex flex-col md:flex-row justify-between md:items-start gap-10 md:gap-6">
          {/* Logo and Contact */}
          <div className="flex flex-col items-start">
            <Image src="/logo.svg" alt="AquaFund Logo" width={150} height={140} className="mb-1" />
            <span className="text-[1.1em]">Based in Adelaide, Australia</span>
            <span className="text-[1.1em]">Reach us: <Link href="mailto:support@aquafund.com" className="">support@aquafund.com</Link></span>
          </div>
          {/* Get Involved */}
          <div className="flex flex-col ">
            <span className="font-semibold mb-2">Get Involved</span>
            {involvedLinks.map(link => (
              <Link key={link.label} href={link.href} className="hover:underline mb-1">{link.label}</Link>
            ))}
          </div>
          {/* About Us */}
          <div className="flex flex-col ">
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
              <Link key={s.label} href={s.href} aria-label={s.label} className="inline-block hover:opacity-80 transition-opacity">
                {s.icon}
              </Link>
            ))}
          </div>
          <span className="font-light">©{new Date().getFullYear()} AquaFund. All rights reserved.</span>
        </div>
      </div>
    </footer>
    </FadeInSection>

  );
}
