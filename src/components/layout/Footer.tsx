import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative bg-lagoon overflow-hidden">
      {/* Subtle depth gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-lagoon to-lagoon-dark pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(var(--teal)_/_0.1),transparent_50%)] pointer-events-none" />

      <div className="relative container mx-auto px-5 lg:px-8 pt-20 pb-10 lg:pt-24 lg:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-14">

          {/* Brand */}
          <div className="lg:col-span-2">
            <Link
              to="/"
              className="font-heading text-2xl font-medium text-pearl hover:text-golden transition-colors duration-300 tracking-[0.25em] uppercase"
            >
              KAM YOGA
            </Link>
            <p className="mt-1.5 font-heading text-[1rem] text-golden/80 italic">
              Yoga by heart
            </p>
            <div className="mt-5 w-8 h-px bg-golden/30" />
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.22em] font-semibold text-golden/60 mb-6">
              Explore
            </h4>
            <ul className="space-y-3.5">
              {[
                { label: "About", href: "/#journey" },
                { label: "Classes", href: "/classes" },
                { label: "Blog", href: "/blog" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className="text-pearl/70 hover:text-pearl/95 transition-colors duration-300 font-body text-[0.8rem] leading-loose"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.22em] font-semibold text-golden/60 mb-6">
              Connect
            </h4>
            <ul className="space-y-4">
              <li>
                <a
                  href="tel:0851051294"
                  className="flex items-center gap-2.5 text-pearl/70 hover:text-pearl/95 transition-colors duration-300 font-body text-[0.8rem]"
                >
                  <Phone size={13} className="shrink-0 text-golden/50" />
                  085 105 1294
                </a>
              </li>
              <li className="flex items-start gap-2.5 text-pearl/70 font-body text-[0.8rem]">
                <MapPin size={13} className="mt-0.5 shrink-0 text-golden/50" />
                <span>Ireland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-6 border-t border-pearl/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-pearl/50 font-body">
            © {currentYear} KAM YOGA. All rights reserved.
          </p>
          <p className="text-[11px] text-pearl/40 font-body italic font-heading">
            Yoga by heart
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
