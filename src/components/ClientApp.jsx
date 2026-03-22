'use client'

import { LanguageProvider } from '../context/LanguageContext'
import Navbar from './Navbar'
import Hero from './Hero'
import About from './About'
import WhyInvest from './WhyInvest'
import InvestmentBenefits from './InvestmentBenefits'
import ProjectHighlights from './ProjectHighlights'
import Gallery from './Gallery'
import EnquiryForm from './EnquiryForm'
import Location from './Location'
import Footer from './Footer'
import WhatsAppButton from './WhatsAppButton'
import ChatBot from './ChatBot'

export default function ClientApp() {
  return (
    <LanguageProvider>
      <div className="min-h-screen">
        <Navbar />
        <Hero />
        <About />
        <WhyInvest />
        <InvestmentBenefits />
        <ProjectHighlights />
        <Gallery />
        <EnquiryForm />
        <Location />
        <Footer />
        <WhatsAppButton />
        <ChatBot />
      </div>
    </LanguageProvider>
  )
}
