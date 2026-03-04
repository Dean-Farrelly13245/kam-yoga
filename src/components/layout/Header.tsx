import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/#journey" },
  { label: "Classes", href: "/classes" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const handleJourneyClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (location.pathname === "/") {
      e.preventDefault();
      const element = document.getElementById("journey");
      if (element) {
        const headerOffset = 80;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth",
        });
      }
      setIsOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-pearl border-b border-border/35 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
      <div className="container mx-auto px-5 lg:px-8">
        <nav className="flex items-center justify-between h-16 md:h-[4.5rem]">

          {/* Logo */}
          <Link
            to="/"
            className="font-heading text-xl md:text-[1.35rem] font-medium text-foreground tracking-[0.22em] hover:text-primary transition-colors duration-300 uppercase"
          >
            KAM YOGA
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={
                    link.href === "/#journey" ? handleJourneyClick : undefined
                  }
                  className="font-body text-[0.82rem] font-medium text-muted-foreground hover:text-foreground transition-colors duration-300 relative after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-0 after:bg-primary/60 hover:after:w-full after:transition-all after:duration-300 pb-0.5 tracking-wide"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <Button
              asChild
              className="rounded-full px-6 py-2 min-h-[38px] bg-golden hover:bg-golden/92 text-lagoon-dark font-semibold shadow-soft hover:shadow-card hover:scale-[1.02] transition-all duration-300 font-body text-[0.82rem] tracking-wide"
            >
              <Link to="/classes">Book a Class</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </nav>

        {/* Mobile Navigation */}
        <div
          className={cn(
            "md:hidden overflow-hidden transition-all duration-300 ease-out",
            isOpen ? "max-h-screen pb-6" : "max-h-0"
          )}
        >
          <ul className="flex flex-col gap-0.5 pt-2 border-t border-border/35">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  to={link.href}
                  onClick={(e) => {
                    if (link.href === "/#journey") {
                      handleJourneyClick(e);
                    } else {
                      setIsOpen(false);
                    }
                  }}
                  className="block font-body text-[0.9rem] text-muted-foreground hover:text-foreground transition-colors duration-300 py-3 px-3 rounded-xl hover:bg-sand/60"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li className="pt-3 pb-1">
              <Button
                asChild
                className="w-full rounded-full py-3 bg-golden hover:bg-golden/92 text-lagoon-dark font-semibold font-body min-h-[48px]"
              >
                <Link to="/classes" onClick={() => setIsOpen(false)}>
                  Book a Class
                </Link>
              </Button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
};

export default Header;
