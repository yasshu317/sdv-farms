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
          <h2 className={`section-heading ${lang === 'te' ? 'telugu' : ''}`}>{t.heading}</h2>
          <p className={`section-subheading ${lang === 'te' ? 'telugu' : ''}`}>{t.subheading}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-10">
          <div className="card flex items-start gap-4">
            <MapPin size={22} className="text-forest-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-800 mb-1">Address</p>
              <p className={`text-gray-500 text-sm ${lang === 'te' ? 'telugu' : ''}`}>{t.address}</p>
            </div>
          </div>
          <div className="card flex items-start gap-4">
            <Phone size={22} className="text-forest-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-800 mb-1">Phone</p>
              <a href={`tel:${t.phone}`} className="text-forest-600 hover:text-forest-700 font-medium text-sm">
                {t.phone}
              </a>
            </div>
          </div>
          <div className="card flex items-start gap-4">
            <Mail size={22} className="text-forest-600 flex-shrink-0 mt-1" />
            <div>
              <p className="font-semibold text-gray-800 mb-1">Email</p>
              <a href={`mailto:${t.email}`} className="text-forest-600 hover:text-forest-700 font-medium text-sm break-all">
                {t.email}
              </a>
            </div>
          </div>
        </div>

        {/* Google Maps embed — Hyderabad outskirts area */}
        <div className="rounded-3xl overflow-hidden shadow-lg border border-gray-100 h-80">
          <iframe
            title="SDV Farms Location"
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
