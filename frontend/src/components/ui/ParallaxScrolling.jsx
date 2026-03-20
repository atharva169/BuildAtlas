import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from '@studio-freight/lenis';
import './ParallaxScrolling.css';

export function ParallaxComponent({ onEnterSite }) {
  const parallaxRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const triggerElement = parallaxRef.current?.querySelector('[data-parallax-layers]');

    if (triggerElement) {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerElement,
          start: "0% 0%",
          end: "100% 0%",
          scrub: 0
        }
      });

      const layers = [
        { layer: "1", yPercent: 70 },
        { layer: "2", yPercent: 55 },
        { layer: "3", yPercent: 40 },
        { layer: "4", yPercent: 10 }
      ];

      layers.forEach((layerObj, idx) => {
        tl.to(
          triggerElement.querySelectorAll(`[data-parallax-layer="${layerObj.layer}"]`),
          {
            yPercent: layerObj.yPercent,
            ease: "none"
          },
          idx === 0 ? undefined : "<"
        );
      });
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
      mouseMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => { lenis.raf(time * 1000); });
    gsap.ticker.lagSmoothing(0);

    return () => {
      ScrollTrigger.getAll().forEach(st => st.kill());
      gsap.killTweensOf(triggerElement);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="parallax" ref={parallaxRef}>
      <section className="parallax__header">
        <div className="parallax__visuals">
          <div className="parallax__black-line-overflow"></div>
          <div data-parallax-layers className="parallax__layers">
            {/* The background sky / clouds */}
            <img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795be09b462b2e8ebf71_osmo-parallax-layer-3.webp" loading="eager" width="800" data-parallax-layer="1" alt="Sky" className="parallax__layer-img" />
            
            {/* Midground elements or cranes */}
            <img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795b4d5ac529e7d3a562_osmo-parallax-layer-2.webp" loading="eager" width="800" data-parallax-layer="2" alt="Midground" className="parallax__layer-img" />
            
            {/* The Text replacing original PARALLAX */}
            <div data-parallax-layer="3" className="parallax__layer-title">
              <h2 className="parallax__title">BUILD ATLAS</h2>
            </div>

            {/* Foreground image: We will use a generic construction image provided by the user (or placeholder if I don't have the exact link) */}
            {/* Since I cannot extract the exact image file, I'll use a placeholder URL for the construction workers image provided in the prompt context. */}
            <div data-parallax-layer="4" className="parallax__layer-img parallax__foreground-container">
               {/* Foreground elements */}
              <img src="https://cdn.prod.website-files.com/671752cd4027f01b1b8f1c7f/6717795bb5aceca85011ad83_osmo-parallax-layer-1.webp" loading="eager" width="800" alt="Foreground" className="parallax__layer-img-inner" />
            </div>
          </div>
          <div className="parallax__fade"></div>
        </div>
      </section>
      
      <section className="parallax__content">
        <div className="parallax__content-inner flex flex-col items-center justify-center min-h-[50vh] text-center w-full px-4 relative z-10">
            <h3 className="text-4xl md:text-5xl font-bold text-white mb-6 uppercase tracking-wider">Welcome to the Future of Construction</h3>
            <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
               Experience AI-powered insights, intelligent resource management, and state-of-the-art tracking.
            </p>
            <button 
               onClick={onEnterSite}
               className="group relative px-8 py-4 bg-teal text-white font-bold text-lg rounded-full overflow-hidden shadow-[0_0_20px_rgba(0,200,150,0.5)] transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,200,150,0.8)]"
            >
               <span className="relative z-10 flex items-center gap-2">
                 Enter Application
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 transform transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                 </svg>
               </span>
               <div className="absolute inset-0 h-full w-full bg-gradient-to-r from-teal-400 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </button>
        </div>
        <div className="absolute bottom-10 inset-x-0 mx-auto w-10 h-10 animate-bounce">
           {/* Decorative scroll down icon or the original SVG */}
          <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 160 160" fill="none" className="osmo-icon-svg text-teal w-12 h-12 mx-auto opacity-50">
            <path d="M94.8284 53.8578C92.3086 56.3776 88 54.593 88 51.0294V0H72V59.9999C72 66.6273 66.6274 71.9999 60 71.9999H0V87.9999H51.0294C54.5931 87.9999 56.3777 92.3085 53.8579 94.8283L18.3431 130.343L29.6569 141.657L65.1717 106.142C67.684 103.63 71.9745 105.396 72 108.939V160L88.0001 160L88 99.9999C88 93.3725 93.3726 87.9999 100 87.9999H160V71.9999H108.939C105.407 71.9745 103.64 67.7091 106.12 65.1938L106.142 65.1716L141.657 29.6568L130.343 18.3432L94.8284 53.8578Z" fill="currentColor"></path>
          </svg>
        </div>
      </section>
    </div>
  );
}
