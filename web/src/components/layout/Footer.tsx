import { Link } from 'react-router-dom'
import { Instagram, Facebook, Twitter, Mail, Phone } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-primary-dark text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-2xl">📦</span>
              <span className="text-xl font-bold">BarakaBox</span>
            </div>
            <p className="text-green-200 text-sm leading-relaxed mb-4">
              Mange mieux. Paye moins. Sauve plus.
            </p>
            <p className="text-green-300 text-xs leading-relaxed">
              La marketplace anti-gaspillage alimentaire du Maroc. Rejoignez des milliers de Marocains qui font le choix de la bonne bouffe sans gaspiller.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Navigation</h3>
            <ul className="space-y-2">
              {[
                { label: 'Accueil', href: '/' },
                { label: 'Offres', href: '/offers' },
                { label: 'Pour les pros', href: '/merchant/register' },
                { label: 'Blog', href: '#' },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-green-300 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="font-semibold text-white mb-4">Légal</h3>
            <ul className="space-y-2">
              {[
                { label: 'Mentions légales', href: '#' },
                { label: 'Politique de confidentialité', href: '#' },
                { label: "Conditions d'utilisation", href: '#' },
                { label: 'Cookies', href: '#' },
              ].map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-green-300 hover:text-secondary text-sm transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* App & Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Téléchargez l'app</h3>
            <div className="space-y-2 mb-6">
              <a
                href="#"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-2xl">🍎</span>
                <div>
                  <p className="text-[10px] text-green-300 leading-none">Disponible sur</p>
                  <p className="text-sm font-semibold leading-tight">App Store</p>
                </div>
              </a>
              <a
                href="#"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 rounded-lg px-3 py-2 transition-colors"
              >
                <span className="text-2xl">🤖</span>
                <div>
                  <p className="text-[10px] text-green-300 leading-none">Disponible sur</p>
                  <p className="text-sm font-semibold leading-tight">Google Play</p>
                </div>
              </a>
            </div>

            <div className="space-y-1">
              <a href="mailto:contact@barakabox.ma" className="flex items-center gap-2 text-green-300 hover:text-secondary text-sm transition-colors">
                <Mail className="w-4 h-4" />
                contact@barakabox.ma
              </a>
              <a href="tel:+212522000000" className="flex items-center gap-2 text-green-300 hover:text-secondary text-sm transition-colors">
                <Phone className="w-4 h-4" />
                +212 5 22 00 00 00
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-green-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-green-400 text-sm">
            © {currentYear} BarakaBox. Tous droits réservés. Fait avec 💚 au Maroc.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-green-400 hover:text-secondary transition-colors">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="#" className="text-green-400 hover:text-secondary transition-colors">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="#" className="text-green-400 hover:text-secondary transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
