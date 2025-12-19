import { Link } from "react-router-dom";
import { Heart, Mail, MapPin } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border">
      <div className="container mx-auto px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="font-heading text-3xl font-medium text-foreground">
              Kam Yoga
            </Link>
            <p className="mt-4 text-muted-foreground font-body leading-relaxed max-w-md">
              A lifelong journey of yoga, meditation, and heart connection. Guided by over 
              two decades of practice and lived experience.
            </p>
            <div className="mt-6 flex items-center gap-2 text-sm text-muted-foreground">
              <Heart size={16} className="text-primary" />
              <span>Teaching with heart since 2008</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-medium text-foreground mb-4">
              Explore
            </h4>
            <ul className="space-y-3">
              {["About", "Classes", "Blog", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-300 font-body text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-medium text-foreground mb-4">
              Connect
            </h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="mailto:hello@kamyoga.com"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors duration-300 font-body text-sm"
                >
                  <Mail size={16} />
                  hello@kamyoga.com
                </a>
              </li>
              <li className="flex items-start gap-2 text-muted-foreground font-body text-sm">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>Ireland</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground font-body">
              © {currentYear} Kam Yoga. All rights reserved.
            </p>
            <p className="text-sm text-muted-foreground font-body flex items-center gap-1">
              Made with <Heart size={14} className="text-primary" /> for the practice
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
