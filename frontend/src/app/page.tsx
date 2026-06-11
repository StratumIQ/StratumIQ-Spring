import Hero                from "@/components/sections/Hero";
import PlatformOverview    from "@/components/sections/PlatformOverview";
import EquipmentCategories from "@/components/sections/EquipmentCategories";
import AftermarketOverview from "@/components/sections/AftermarketOverview";
import Service             from "@/components/sections/Service";
import BlogPreview         from "@/components/sections/BlogPreview";
import WhyChoose           from "@/components/sections/WhyChoose";
import Testimonials        from "@/components/sections/Testimonials";

export default function Home() {
  return (
    <main>
      <Hero />
      <PlatformOverview />
      <EquipmentCategories />
      <AftermarketOverview />
      <Service />
      <BlogPreview />
      <WhyChoose />
      <Testimonials />
    </main>
  );
}