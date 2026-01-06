import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          {/* About */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-foreground">
              ABOUT US
            </h3>

            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Artistry Home is your premium destination for beautiful home decor items including
              canvas paintings, crystal glass art, premium wallpapers, and unique wall clocks.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook size={20} />
              </a>

              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>

              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>

              <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
                 className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube size={20} />
              </a>
            </div>
          </div>

          {/* My Account */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-foreground">
              MY ACCOUNT
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/cart" className="hover:text-primary">Cart</Link></li>
              <li><Link to="/wishlist" className="hover:text-primary">Wishlist</Link></li>
              <li><Link to="/orders" className="hover:text-primary">Track Order</Link></li>
              <li><Link to="/login" className="hover:text-primary">Login / Register</Link></li>
            </ul>
          </div>

          {/* Useful Links */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-foreground">
              USEFUL LINKS
            </h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/blog" className="hover:text-primary">Blog</Link></li>
              <li><Link to="/contact" className="hover:text-primary">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-primary">FAQ</Link></li>
              <li><Link to="/privacy" className="hover:text-primary">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary">Terms & Conditions</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-display text-xl font-semibold mb-4 text-foreground">
              CONTACT US
            </h3>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-3">
                <MapPin size={18} className="text-primary" />
                <span className="text-muted-foreground">Cloud Nexus, E-5 Arera Colony, Bhopal, MP - 462016</span>
              </li>

              <li className="flex gap-3">
                <Phone size={18} className="text-primary" />
                <a href="tel:+919009536046" className="hover:text-primary">
                  +91 90095 36046
                </a>
              </li>

              <li className="flex gap-3">
                <Mail size={18} className="text-primary" />
                <a href="mailto:hello@artistryhome.in" className="hover:text-primary">
                  hello@artistryhome.in
                </a>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-border py-6">
        <div className="container flex flex-col md:flex-row justify-between items-center gap-2">
          <p className="text-sm text-muted-foreground">
            © 2026 <span className="text-primary font-semibold">Artistry Home</span>
          </p>

          <div className="flex gap-4 text-sm">
            <Link to="/privacy" className="hover:text-primary">Privacy</Link>
            <Link to="/terms" className="hover:text-primary">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
