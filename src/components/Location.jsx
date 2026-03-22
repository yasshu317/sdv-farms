'use client'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useLang } from '../context/LanguageContext'
import { content } from '../data/content'

export default function Location() {
  const { lang } = useLang()
  const t = content[lang].location

  return (
    <section id="location" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <span className="inline-block text-terracotta-600 font-semibold text-xs uppercase tracking-[0.2em] mb-3">
            Location
          </span>
          <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
          <div className="gold-divider" />
          <p className={`section-subheading -mt-4 ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 mb-8">
          {[
            { Icon: MapPin, label: lang === 'en' ? 'Address' : 'చిరునామా', value: t.address, href: null },
            { Icon: Phone, label: lang === 'en' ? 'Phone' : 'ఫోన్', value: t.phone, href: `tel:${t.phone}` },
            { Icon: Mail, label: lang === 'en' ? 'Email' : 'ఇమెయిల్', value: t.email, href: `mailto:${t.email}` },
          ].map(({ Icon, label, value, href }, i) => (
            <div key={i} className="flex items-start gap-4 bg-cream border border-turmeric-100 rounded-2xl p-5 hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-paddy-100 rounded-xl flex items-center justify-center flex-shrink-0">
                <Icon size={20} className="text-paddy-700" />
              </div>
              <div>
                <p className="text-xs font-semibold text-turmeric-600 uppercase tracking-wide mb-0.5">{label}</p>
                {href ? (
                  <a href={href} className={`text-paddy-700 hover:text-paddy-900 font-medium text-sm break-all ${lang === 'te' ? 'telugu' : ''}`}>
                    {value}
                  </a>
                ) : (
                  <p className={`text-gray-600 text-sm ${lang === 'te' ? 'telugu' : ''}`}>{value}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Google Maps embed */}
        <div className="rounded-3xl overflow-hidden shadow-lg border-2 border-turmeric-100 h-80">
          <iframe
            title="SDV Farms Location – Hyderabad"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d243647.28268609604!2d78.24323255!3d17.4126009!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9904b0f24e87%3A0x34610ac25ac04769!2sHyderabad%2C%20Telangana!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  )
}
