/**
 * FAQ keyword matching for the chat widget. Replies come from content.js (en/te).
 */
import { content } from '../data/content.js'

/** Order matters: first match wins (same as legacy ChatBot). */
export const CHATBOT_FAQ_RULES = [
  {
    key: 'properties',
    matchEn: /\b(how many|propert|listings?|available land|browse)\b/i,
    matchTe: /(ఎన్ని|ప్రాపర్టీ|ఆస్తులు|జాబితా|బ్రౌజ్|అందుబాటులో|భూమి.*ఎన్ని)/i,
  },
  {
    key: 'sell',
    matchEn: /\b(sell|list my land|seller|post land|add property|how to list)\b/i,
    matchTe: /(అమ్మ|విక్రయం|విక్రేత|జాబితా చేయ్|నా భూమి|ఎలా అమ్మ)/i,
  },
  {
    key: 'buy',
    matchEn: /\b(buy|purchase|buyer|looking for land|find land|invest)\b/i,
    matchTe: /(కొను|కొనుగోలు|కొనుగోలుదారు|భూమి కావాలి|పెట్టుబడి)/i,
  },
  {
    key: 'services',
    matchEn: /\b(service|fencing|borewell|drip|irrigation|farming plan|plant|crop|farmhouse)\b/i,
    matchTe: /(సేవ|ఫెన్సింగ్|బోర్వెల్|డ్రిప్|నీటిపారుదల|వ్యవసాయ ప్రణాళిక|మొక్కలు|పంట|ఫార్మ్)/i,
  },
  {
    key: 'contact',
    matchEn: /\b(contact|phone|call|whatsapp|email|reach|number|address|office)\b/i,
    matchTe: /(సంప్రదించు|ఫోన్|కాల్|వాట్సాప్|ఇమెయిల్|నంబర్|చిరునామా|కార్యాలయం)/i,
  },
  {
    key: 'price',
    matchEn: /\b(price|cost|rate|per acre|how much|charge|fee|rupee|lakh|crore)\b/i,
    matchTe: /(ధర|ఖర్చు|రేటు|ఎకరానికి|ఎంత|ఛార్జీ|లక్ష|కోటి)/i,
  },
  {
    key: 'location',
    matchEn: /\b(location|where|address|near|hyderabad|telangana|andhra|karnataka|state|districts?|mandal)\b/i,
    matchTe: /(స్థానం|ఎక్కడ|చిరునామా|సమీపం|హైదరాబాద్|తెలంగాణ|ఆంధ్ర|కర్ణాటక|రాష్ట్రం|జిల్లా|మండలం)/i,
  },
  {
    key: 'legal',
    matchEn: /\b(government|approved|legal|title|document|pahani|ror|adangal|rtc|verified)\b/i,
    matchTe: /(ప్రభుత్వ|ఆమోదం|చట్టం|శీర్షిక|పత్రం|పహానీ|ధృవీకరణ|ఆర్‌టీసీ)/i,
  },
  {
    key: 'help',
    matchEn: /^(\?+|help|hi|hello|hey|namaste|నమస్కారం|హలో|ఏమి చేయగలరు)$/i,
    matchTe: /^(\?+|సహాయం|నమస్కారం|హలో|హాయ్)$/i,
  },
  {
    key: 'appointment',
    matchEn: /\b(appointment|site visit|visit|book|slot|schedule)\b/i,
    matchTe: /(అపాయింట్‌మెంట్|సైట్ విజిట్|సందర్శన|బుక్|స్లాట్|షెడ్యూల్|విజిట్)/i,
  },
]

export function matchFAQ(text, lang, propertyCount) {
  const faqLib = content[lang]?.chatbot?.faq
  if (!faqLib || !text?.trim()) return null
  for (const rule of CHATBOT_FAQ_RULES) {
    const enOk = rule.matchEn.test(text)
    const teOk = rule.matchTe && rule.matchTe.test(text)
    if (enOk || teOk) {
      const fn = faqLib[rule.key]
      if (typeof fn === 'function') return fn(propertyCount)
    }
  }
  return null
}
