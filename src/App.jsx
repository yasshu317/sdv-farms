import { LanguageProvider } from './context/LanguageContext'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import WhyInvest from './components/WhyInvest'
import InvestmentBenefits from './components/InvestmentBenefits'
import ProjectHighlights from './components/ProjectHighlights'
import Gallery from './components/Gallery'
import EnquiryForm from './components/EnquiryForm'
import Location from './components/Location'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'

export default function App() {
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
      </div>
    </LanguageProvider>
  )
}
