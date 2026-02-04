'use client';

import { useEffect, useRef, useState } from 'react';

interface HeroSectionProps {
  onSupportClick?: () => void
}

export default function HeroSection({ onSupportClick }: HeroSectionProps) {
  const [scrollY, setScrollY] = useState(0);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [currentBgImage, setCurrentBgImage] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  
  const backgroundImages = ['/images/banner.png', '/images/banner-2.png'];

  // Text slides for the hero section - each slide contains title, subtitle, and description
  const textSlides = [
    {
      title: "OUR CONSTITUTION.",
      titleSecondary: "OUR FUTURE.",
      subtitle: "Non partisan inclusive political organization",
      description: "Zimbabwe's Constitution was adopted by the people to limit power, protect rights and guarantee democratic governance. Today, that constitutional promise is under threat from both mutilation and non-implementation.",
    },
    {
      title: "DEFENDING DEMOCRACY.",
      titleSecondary: "PROTECTING RIGHTS.",
      subtitle: "Defending Constitutional Supremacy",
      description: "We work tirelessly to ensure Zimbabwe's Constitution is respected, implemented, and protected from mutilation or disregard. Join us in defending the foundation of our democracy.",
    },
    {
      title: "CITIZEN EMPOWERMENT.",
      titleSecondary: "COMMUNITY ACTION.",
      subtitle: "Protecting Democratic Values",
      description: "Through civic education, advocacy, and community engagement, we empower citizens to understand their rights and participate actively in democratic governance.",
    },
    {
      title: "UNITED FOR CHANGE.",
      titleSecondary: "BUILDING TOMORROW.",
      subtitle: "A Movement for Lawful Governance",
      description: "Join thousands of citizens working together to oppose the 2030 agenda, defend the Constitution, and protect our democratic values for future generations.",
    },
  ];

  useEffect(() => {
    const handleScroll = () => {
      if (heroRef.current) {
        const rect = heroRef.current.getBoundingClientRect();
        const scrolled = window.scrollY;
        // Only apply parallax when section is visible
        if (rect.bottom > 0 && rect.top < window.innerHeight) {
          setScrollY(scrolled);
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Auto-rotate text slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % textSlides.length);
    }, 8000); // Change slide every 8 seconds

    return () => clearInterval(interval);
  }, [textSlides.length]);

  // Auto-rotate background images
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBgImage((prev) => (prev + 1) % backgroundImages.length);
    }, 12000); // Change background every 12 seconds

    return () => clearInterval(interval);
  }, [backgroundImages.length]);

  // Parallax effect: background moves slower than scroll
  const parallaxOffset = scrollY * 0.5;

  return (
    <section
      ref={heroRef}
      id="intro"
      className="relative flex min-h-screen items-end justify-center overflow-hidden pt-16 sm:pt-20"
    >
      {/* Background with parallax - smooth crossfade */}
      {backgroundImages.map((image, index) => (
        <div
          key={image}
          className="absolute inset-0 z-0 transition-opacity duration-[3000ms] ease-in-out"
          style={{
            backgroundImage: `url(${image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `translateY(${parallaxOffset}px)`,
            willChange: 'transform, opacity',
            opacity: index === currentBgImage ? 1 : 0,
            pointerEvents: index === currentBgImage ? 'auto' : 'none',
            transition: 'opacity 3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        />
      ))}
      {/* Dark overlay for better text visibility */}
      <div className="absolute inset-0 z-[1] bg-black/30" />
      {/* Content layer */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 pb-12 text-center sm:px-6 sm:pb-20">
        <div className="relative">
          {textSlides.map((slide, index) => (
            <div
              key={index}
              className={`transition-opacity duration-3000 ${
                index === currentSlide
                  ? 'opacity-100'
                  : 'opacity-0 pointer-events-none absolute inset-0'
              }`}
            >
              {/* Spacer to maintain exact positioning after removing titles */}
              <div className="mb-4 sm:mb-6" />

              <p className="mx-auto mb-6 max-w-2xl text-lg font-bold text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] sm:mb-8 sm:text-xl md:text-2xl lg:text-3xl">
                {slide.subtitle}
              </p>
              
              <p className="mx-auto mb-8 max-w-3xl text-sm font-normal text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)] sm:mb-10 sm:text-base md:text-lg">
                {slide.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex animate-fade-in-up animate-delay-300 flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <a
            href="/signup"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-slate-900/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-slate-800/90 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Join The Movement
          </a>
          <a
            href="/petitions"
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-slate-900/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-slate-800/90 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Sign the People's Resolution
          </a>
          <button
            onClick={onSupportClick}
            className="inline-flex w-full items-center justify-center rounded-lg border-2 border-white bg-slate-900/90 backdrop-blur-sm px-6 py-3 text-sm font-semibold text-white shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:bg-slate-800/90 transition-colors sm:w-auto sm:px-8 sm:py-4 sm:text-base"
          >
            Support the Work
          </button>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 animate-bounce sm:bottom-10">
          <svg className="h-5 w-5 text-white sm:h-6 sm:w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </section>
  );
}

