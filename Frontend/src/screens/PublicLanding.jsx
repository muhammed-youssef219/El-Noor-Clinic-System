import LandingNavbar from "../components/landing/LandingNavbar";
import HeroSection from "../components/landing/HeroSection";
import SpecialtiesSection from "../components/landing/SpecialtiesSection";
import DoctorsSection from "../components/landing/DoctorsSection";
import ServicesSection from "../components/landing/ServicesSection";
import LandingFooter from "../components/landing/LandingFooter";

export default function PublicLanding() {
  return (
    <div>
      <LandingNavbar />
      <HeroSection />
      <SpecialtiesSection />
      <DoctorsSection />
      <ServicesSection />
      <LandingFooter />
    </div>
  );
}
