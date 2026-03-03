import { Link } from "react-router-dom";
import { Phone, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-sage-dark/20 border-t border-foreground/15">
      <div className="container mx-auto px-5 lg:px-8 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-heading text-2xl font-medium text-foreground hover:text-foreground/70 transition-colors duration-300">
              Kamyoga
            </Link>
            <p className="mt-4 text-muted-foreground font-body text-xs leading-loose max-w-xs">
              A lifelong journey of yoga, meditation, and heart connection. Guided by over 
              two decades of practice and lived experience.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground/50 mb-5">
              Explore
            </h4>
            <ul className="space-y-3.5">
              {["About", "Classes", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-body text-xs leading-loose"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-body text-[10px] uppercase tracking-[0.2em] font-semibold text-foreground/50 mb-5">
              Connect
            </h4>
            <ul className="space-y-3.5">
              <li>
                <a
                  href="tel:0851051294"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 font-body text-xs"
                >
                  <Phone size={13} className="shrink-0" />
                  085 105 1294
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground font-body text-xs">
                <MapPin size={13} className="mt-0.5 shrink-0" />
                <span>Ireland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-14 pt-6 border-t border-foreground/15">
          <p className="text-[11px] text-muted-foreground/60 font-body text-center sm:text-left">
            © {currentYear} Kamyoga. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
