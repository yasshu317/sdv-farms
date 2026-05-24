'use client'

import { LanguageProvider } from '../context/LanguageContext'
import Navbar from './Navbar'
import Hero from './Hero'
import HowItWorks from './HowItWorks'
import About from './About'
import WhyInvest from './WhyInvest'
import InvestmentBenefits from './InvestmentBenefits'
import ProjectHighlights from './ProjectHighlights'
import FeaturedProperties from './FeaturedProperties'
import HomeStatsBar from './HomeStatsBar'
import Gallery from './Gallery'
import EnquiryForm from './EnquiryForm'
import SampleDocuments from './SampleDocuments'
import Testimonials from './Testimonials'
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
        <HomeStatsBar />
        <HowItWorks />
        <About />
        <WhyInvest />
        <InvestmentBenefits />
        <ProjectHighlights />
        <FeaturedProperties />
        <Gallery />
        <Testimonials />
        <EnquiryForm />
        <SampleDocuments />
        <Location />
        <Footer />
        <WhatsAppButton />
        <ChatBot />
      </div>
    </LanguageProvider>
  )
}
