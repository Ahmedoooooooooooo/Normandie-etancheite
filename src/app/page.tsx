import Link from 'next/link'
import BeforeAfterSlider from './BeforeAfterSlider'

const LOGO_NAVY = '/Normandie-etancheite/logo-navy.png'
const LOGO_WHITE = '/Normandie-etancheite/logo-white.png'

const PORTFOLIO = [
  {
    before: '/Normandie-etancheite/portfolio/chantier-1-avant.svg',
    after: '/Normandie-etancheite/portfolio/chantier-1-apres.svg',
    title: 'Toiture terrasse',
    location: 'Flers (61)',
  },
  {
    before: '/Normandie-etancheite/portfolio/chantier-2-avant.svg',
    after: '/Normandie-etancheite/portfolio/chantier-2-apres.svg',
    title: 'Couverture ardoise',
    location: 'Caen (14)',
  },
  {
    before: '/Normandie-etancheite/portfolio/chantier-3-avant.svg',
    after: '/Normandie-etancheite/portfolio/chantier-3-apres.svg',
    title: 'Étanchéité bac acier',
    location: 'Argentan (61)',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_NAVY} alt="Normandie Étanchéité" className="h-9 w-auto" />
              <span className="text-brand-blue font-bold text-lg leading-tight">
                Normandie<br className="hidden sm:block" />
                <span className="text-sage-700">Étanchéité</span>
              </span>
            </Link>
            <Link
              href="/rendez-vous"
              className="bg-sage hover:bg-sage-700 text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Prendre RDV
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-brand-blue text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_WHITE} alt="Normandie Étanchéité" className="h-20 w-auto mx-auto mb-8" />
          <div className="inline-block bg-sage text-white text-sm font-semibold px-4 py-1 rounded-full mb-6">
            Devis gratuit • Intervention rapide
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Expert en étanchéité<br />
            <span className="text-sage">à Flers</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-4 font-light">
            Couverture · Étanchéité · Rénovation
          </p>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Protégez votre toiture avec un artisan local de confiance. Interventions dans toute la Normandie.
          </p>
          <Link
            href="/rendez-vous"
            className="inline-block bg-sage hover:bg-sage-700 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors duration-200 shadow-lg"
          >
            Demander un devis gratuit →
          </Link>
        </div>
      </section>

      {/* Portfolio / Avant - Après */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">Nos chantiers</h2>
            <p className="text-slate-500 text-lg">Glissez le curseur pour découvrir l&apos;avant / après</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {PORTFOLIO.map((p) => (
              <BeforeAfterSlider
                key={p.title}
                before={p.before}
                after={p.after}
                title={p.title}
                location={p.location}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">Pourquoi nous choisir ?</h2>
            <p className="text-slate-500 text-lg">La qualité et la confiance au cœur de notre métier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-blue text-lg mb-2">Devis gratuit</h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-blue text-lg mb-2">Intervention rapide</h3>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-brand-blue text-lg mb-2">Garantie décennale</h3>
            </div>
          </div>
        </div>
      </section>

      {/* Zone d'intervention */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-brand-blue mb-3">Zone d&apos;intervention</h2>
            <p className="text-slate-500 text-lg">Basés à Flers, nous intervenons dans toute la Normandie</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-center">
              {['Flers', 'Caen', 'Alençon', 'Argentan', 'Saint-Lô', 'Falaise', 'Vire', 'Condé-en-Normandie', 'Tinchebray', 'Domfront', 'Briouze', 'La Ferté-Macé', 'Mortagne-au-Perche'].map((ville) => (
                <span
                  key={ville}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    ville === 'Flers'
                      ? 'bg-sage text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ville}
                </span>
              ))}
            </div>
            <p className="text-center text-slate-400 text-sm mt-6">
              Vous n&apos;êtes pas dans cette liste ? Contactez-nous, nous intervenons dans toute la Normandie.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-brand-blue text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à démarrer votre projet ?</h2>
          <p className="text-slate-300 text-lg mb-3">
            Contactez-nous dès aujourd&apos;hui pour un devis gratuit et sans engagement.
          </p>
          <p className="text-slate-400 mb-10">
            16 Impasse Beau Vallon, 61100 Flers
          </p>
          <Link
            href="/rendez-vous"
            className="inline-block bg-sage hover:bg-sage-700 text-white font-bold px-12 py-4 rounded-xl text-lg transition-colors duration-200 shadow-lg"
          >
            Prendre rendez-vous gratuitement →
          </Link>
          <p className="text-slate-400 text-sm mt-6">Sans engagement · Réponse sous 24h · Artisan local</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_WHITE} alt="Normandie Étanchéité" className="h-8 w-auto" />
            <span className="text-white font-semibold">Normandie Étanchéité</span>
          </div>
          <p className="text-sm">© 2025 Normandie Étanchéité — Tous droits réservés</p>
          <p className="text-sm">16 Impasse Beau Vallon, 61100 Flers</p>
        </div>
      </footer>
    </div>
  )
}
