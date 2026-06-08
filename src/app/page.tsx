import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white shadow-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">N</span>
              </div>
              <span className="text-[#1e3a5f] font-bold text-lg leading-tight">
                Normandie<br className="hidden sm:block" />
                <span className="text-orange-500">Étanchéité</span>
              </span>
            </div>
            <Link
              href="/rendez-vous"
              className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-2 rounded-lg transition-colors duration-200 text-sm sm:text-base"
            >
              Prendre RDV
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-[#1e3a5f] text-white py-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block bg-orange-500 text-white text-sm font-semibold px-4 py-1 rounded-full mb-6">
            Artisan certifié • Devis gratuit
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Expert en étanchéité<br />
            <span className="text-orange-500">à Flers</span>
          </h1>
          <p className="text-xl sm:text-2xl text-slate-300 mb-4 font-light">
            Couverture · Étanchéité · Rénovation
          </p>
          <p className="text-slate-400 mb-10 max-w-2xl mx-auto">
            Protégez votre toiture avec un artisan local de confiance. Intervention rapide dans tout le Calvados et l'Orne.
          </p>
          <Link
            href="/rendez-vous"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-10 py-4 rounded-xl text-lg transition-colors duration-200 shadow-lg"
          >
            Demander un devis gratuit →
          </Link>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-3">Nos prestations</h2>
            <p className="text-slate-500 text-lg">Des solutions durables pour votre toiture</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-200">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Étanchéité toiture</h3>
              <p className="text-slate-500 leading-relaxed">
                Traitement des fuites, pose de membranes d'étanchéité, isolation sous toiture. Intervention sur tous types de toitures plates et terrasses.
              </p>
            </div>
            {/* Card 2 */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-200">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Couverture ardoise &amp; tuile</h3>
              <p className="text-slate-500 leading-relaxed">
                Pose, réfection et entretien de toitures en ardoise naturelle ou artificielle et en tuiles. Travail soigné dans le respect des traditions normandes.
              </p>
            </div>
            {/* Card 3 */}
            <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100 hover:shadow-lg transition-shadow duration-200">
              <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-5">
                <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-[#1e3a5f] mb-3">Rénovation &amp; urgences</h3>
              <p className="text-slate-500 leading-relaxed">
                Réparation d'urgence après tempête ou sinistre, rénovation complète de toiture ancienne, nettoyage et traitement anti-mousse.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why us */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-3">Pourquoi nous choisir ?</h2>
            <p className="text-slate-500 text-lg">La qualité et la confiance au cœur de notre métier</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">Devis gratuit</h3>
              <p className="text-slate-500 text-sm">Estimation sans engagement, transparente et détaillée sous 24h</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">Intervention rapide</h3>
              <p className="text-slate-500 text-sm">Disponible 6j/7, urgences traitées en priorité absolue</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">Artisan certifié</h3>
              <p className="text-slate-500 text-sm">Qualibat RGE, maîtrise complète des normes DTU en vigueur</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-[#1e3a5f] rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="font-bold text-[#1e3a5f] text-lg mb-2">Garantie décennale</h3>
              <p className="text-slate-500 text-sm">Assurance décennale et responsabilité civile professionnelle</p>
            </div>
          </div>
        </div>
      </section>

      {/* Zone d'intervention */}
      <section className="py-20 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-bold text-[#1e3a5f] mb-3">Zone d&apos;intervention</h2>
            <p className="text-slate-500 text-lg">Flers et 80 km alentour</p>
          </div>
          <div className="bg-white rounded-2xl shadow-md p-8 border border-slate-100">
            <div className="flex flex-wrap gap-3 justify-center">
              {['Flers', 'Caen', 'Alençon', 'Argentan', 'Saint-Lô', 'Falaise', 'Vire', 'Condé-en-Normandie', 'Tinchebray', 'Domfront', 'Briouze', 'La Ferté-Macé', 'Mortagne-au-Perche'].map((ville) => (
                <span
                  key={ville}
                  className={`px-4 py-2 rounded-full text-sm font-semibold ${
                    ville === 'Flers'
                      ? 'bg-orange-500 text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {ville}
                </span>
              ))}
            </div>
            <p className="text-center text-slate-400 text-sm mt-6">
              Vous n&apos;êtes pas dans cette liste ? Contactez-nous, nous intervenons jusqu&apos;à 80 km de Flers.
            </p>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section className="py-20 px-4 bg-[#1e3a5f] text-white">
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
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white font-bold px-12 py-4 rounded-xl text-lg transition-colors duration-200 shadow-lg"
          >
            Prendre rendez-vous gratuitement →
          </Link>
          <p className="text-slate-400 text-sm mt-6">Sans engagement · Réponse sous 24h · Artisan local</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 px-4">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-xs">N</span>
            </div>
            <span className="text-white font-semibold">Normandie Étanchéité</span>
          </div>
          <p className="text-sm">© 2025 Normandie Étanchéité — Tous droits réservés</p>
          <p className="text-sm">16 Impasse Beau Vallon, 61100 Flers</p>
        </div>
      </footer>
    </div>
  )
}
