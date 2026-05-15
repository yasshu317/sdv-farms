'use client'
import { useLang } from '../context/LanguageContext'

const DOCS = [
  {
    icon: '📄',
    en: { title: 'Sale Deed Format', desc: 'Standard registered sale deed template used for agricultural land transfer in Telangana & AP.' },
    te: { title: 'అమ్మకపు పత్రం నమూనా', desc: 'తెలంగాణ & ఆంధ్రప్రదేశ్‌లో వ్యవసాయ భూమి బదిలీకి ఉపయోగించే ప్రామాణిక రిజిస్టర్డ్ అమ్మకం పత్రం నమూనా.' },
  },
  {
    icon: '🤝',
    en: { title: 'Lease Agreement Format', desc: 'Template agreement for leasing agricultural land, covering tenure, rent, and maintenance responsibilities.' },
    te: { title: 'లీజు ఒప్పందం నమూనా', desc: 'కాలపరిమితి, అద్దె మరియు నిర్వహణ బాధ్యతలతో వ్యవసాయ భూమిని లీజుకు ఇవ్వడానికి నమూనా ఒప్పందం.' },
  },
  {
    icon: '✅',
    en: { title: 'Pahani / Adangal Guide', desc: 'How to read and verify a Pahani (Telangana) or Adangal / 1B (AP) land record — what each column means.' },
    te: { title: 'పహాణీ / అదంగల్ గైడ్', desc: 'పహాణీ (తెలంగాణ) లేదా అదంగల్ / 1B (AP) భూమి రికార్డును చదవడం మరియు ధృవీకరించడం ఎలాగో — ప్రతి కాలమ్ అర్థం.' },
  },
  {
    icon: '🏛️',
    en: { title: 'Registration Process', desc: 'Step-by-step guide to registering an agricultural land purchase at the sub-registrar office.' },
    te: { title: 'రిజిస్ట్రేషన్ ప్రక్రియ', desc: 'సబ్-రిజిస్ట్రార్ కార్యాలయంలో వ్యవసాయ భూమి కొనుగోలును నమోదు చేయడానికి దశల వారీ గైడ్.' },
  },
]

export default function SampleDocuments() {
  const { lang } = useLang()

  return (
    <section id="sample-docs" className="py-16 px-4 sm:px-6 border-t border-white/8" style={{ background: 'linear-gradient(180deg, #071709 0%, #0a1f0c 100%)' }}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-turmeric-400/80 mb-3">
            Free Resources
          </span>
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-white mb-3">
            {lang === 'te' ? 'నమూనా పత్రాలు' : 'Sample Documents'}
          </h2>
          <p className="text-white/50 text-sm max-w-xl mx-auto">
            {lang === 'te'
              ? 'మీ భూమి లావాదేవీని అర్థం చేసుకోవడానికి ఉచిత మార్గదర్శి పత్రాలు.'
              : 'Free reference documents to help you understand your land transaction — lease formats, sale deeds, and more.'}
          </p>
        </div>

        {/* Document cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {DOCS.map((doc, i) => {
            const d = doc[lang] || doc.en
            return (
              <div
                key={i}
                className="flex items-start gap-4 bg-white/4 hover:bg-white/7 border border-white/10 hover:border-turmeric-400/20 rounded-2xl p-5 transition-all group"
              >
                <div className="text-3xl shrink-0 group-hover:scale-110 transition-transform">{doc.icon}</div>
                <div>
                  <h3 className={`text-white font-semibold text-sm mb-1 ${lang === 'te' ? 'telugu' : ''}`}>
                    {d.title}
                  </h3>
                  <p className={`text-white/50 text-xs leading-relaxed ${lang === 'te' ? 'telugu' : ''}`}>
                    {d.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA */}
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4">
            {lang === 'te'
              ? 'మీకు వ్యక్తిగతీకరించిన సహాయం కావాలా? SDV Farms బృందం మీకు సహాయపడుతుంది.'
              : 'Need personalised help with documents? Talk to the SDV Farms team.'}
          </p>
          <a
            href="https://wa.me/917780312525?text=Hi%2C+I+need+help+with+land+documents"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/15 border border-white/15 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all"
          >
            💬 {lang === 'te' ? 'బృందంతో మాట్లాడండి' : 'Talk to Our Team'}
          </a>
        </div>
      </div>
    </section>
  )
}
