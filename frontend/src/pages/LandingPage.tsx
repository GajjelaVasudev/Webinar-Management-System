import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Play,
  MapPin,
  Clock,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  ArrowRight,
  Instagram,
} from "lucide-react";
import Logo from "../components/Logo";

// Interfaces
interface Speaker {
  name: string;
  role: string;
  image: string;
}

interface EventItem {
  date: string;
  month: string;
  year: string;
  title: string;
  location: string;
  time: string;
}

interface Testimonial {
  name: string;
  role: string;
  image: number;
  text: string;
  rating: number;
}

const testimonials: Testimonial[] = [
  {
    name: "Maria Santos",
    role: "Event Manager, TechCorp",
    image: 12,
    text: "This platform completely transformed how we manage our quarterly tech conferences. The registration system is intuitive, and our attendees love the seamless experience.",
    rating: 5
  },
  {
    name: "James Mitchell",
    role: "Director of Marketing, InnovateLabs",
    image: 13,
    text: "We've hosted 8 webinars and the platform scales perfectly. The speaker coordination tools saved our team hours of coordination work.",
    rating: 5
  },
  {
    name: "Lisa Wong",
    role: "Conference Lead, Global Tech Summit",
    image: 14,
    text: "The live streaming integration is flawless. We streamed to 12,000+ attendees across 50 countries without any issues. Highly recommended!",
    rating: 5
  },
  {
    name: "Robert Chen",
    role: "CEO, Developr Studios",
    image: 15,
    text: "The analytics dashboard gives us incredible insights into attendee behavior. We've improved our event ROI by 40% using their platform.",
    rating: 5
  }
];

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [typedWords, setTypedWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isTypingComplete, setIsTypingComplete] = useState(false);
  const [showSubtitle, setShowSubtitle] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const words = ["Host.", "Manage.", "Scale."];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.scroll-reveal');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (currentWordIndex < words.length) {
      const currentWord = words[currentWordIndex];
      if (currentCharIndex < currentWord.length) {
        const timeout = setTimeout(() => {
          setCurrentCharIndex(currentCharIndex + 1);
        }, 100);
        return () => clearTimeout(timeout);
      } else {
        const timeout = setTimeout(() => {
          setTypedWords([...typedWords, currentWord]);
          setCurrentWordIndex(currentWordIndex + 1);
          setCurrentCharIndex(0);
        }, 400);
        return () => clearTimeout(timeout);
      }
    } else if (!isTypingComplete) {
      setTimeout(() => {
        setIsTypingComplete(true);
        setTimeout(() => setShowSubtitle(true), 200);
      }, 300);
    }
  }, [currentWordIndex, currentCharIndex, typedWords, isTypingComplete]);

  return (
    <div className="font-sans text-slate-800 w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-200 ${
        isScrolled 
          ? 'bg-[#1e1b4b]/80 backdrop-blur-lg shadow-lg border-b border-white/10' 
          : 'bg-transparent'
      }`}>
        <div className="flex justify-between items-center px-8 py-6 text-white max-w-7xl mx-auto">
          <Logo theme="white" />
          <div className="hidden md:flex space-x-8 text-sm font-medium items-center">
            <a href="#" className="hover:text-pink-400 transition-colors duration-200">
              Home
            </a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">
            About us
          </a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">
            Events
          </a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">
            Speakers
          </a>
          <a href="#" className="hover:text-pink-400 transition-colors duration-200">
            Contact
          </a>
          <button
            onClick={() => navigate("/auth?mode=login")}
            className="border-2 border-white px-6 py-2 rounded-full hover:bg-white hover:text-[#1e1b4b] transition-all duration-200 font-semibold"
          >
            Login
          </button>
          <button
            onClick={() => navigate("/auth?mode=register")}
            className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 transition-all duration-200 font-semibold hover:shadow-lg hover:shadow-pink-500/50"
          >
            Register
          </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-[#1e1b4b] text-white min-h-screen flex items-center overflow-hidden pt-24 md:pt-28">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777]"></div>
        
        {/* Subtle Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-pink-500/10 rounded-full blur-3xl"></div>
        
        {/* Grain Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='4' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}></div>
        
        <div className="absolute top-20 left-10 opacity-10">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full py-8">
          <div className="max-w-5xl mx-auto text-center">
            {/* Main Headline - Typing Animation */}
            <div className="mb-5">
              <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight leading-none">
                {typedWords.map((word, index) => (
                  <div key={index} className="mb-2">
                    {word}
                  </div>
                ))}
                {currentWordIndex < words.length && (
                  <div className="mb-2">
                    {words[currentWordIndex].slice(0, currentCharIndex)}
                    <span className="inline-block w-1 h-14 lg:h-16 xl:h-20 bg-pink-500 ml-1 animate-blink"></span>
                  </div>
                )}
              </h1>
            </div>
            
            {/* Subtitle - Fade in after typing */}
            <div 
              className={`transition-all duration-700 ease-in-out ${
                showSubtitle 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-2'
              }`}
            >
              <h2 className="text-3xl lg:text-4xl xl:text-5xl font-medium text-gray-100 tracking-wide mb-8">
                Global Tech Events.
              </h2>
            </div>
            
            {/* Description and CTAs - Fade in after subtitle */}
            <div 
              className={`transition-all duration-700 ease-in-out delay-200 ${
                showSubtitle 
                  ? 'opacity-100 translate-y-0' 
                  : 'opacity-0 translate-y-3'
              }`}
            >
              <p className="text-gray-300 text-base lg:text-lg mb-8 max-w-2xl mx-auto leading-relaxed">
                A complete webinar and conference management system built for organizers, speakers, and attendees. From ticketing to live sessions, everything in one seamless experience.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 mb-10 justify-center items-center">
                <button 
                  onClick={() => navigate("/auth?mode=register")}
                  className="group relative bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white px-10 py-3.5 rounded-full font-semibold transition-all duration-200 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/40"
                >
                  Get Started
                  <ArrowRight className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-200" size={18} />
                </button>
                <button 
                  onClick={() => navigate("/auth?mode=login")}
                  className="border-2 border-white/80 text-white hover:bg-white hover:text-[#1e1b4b] px-10 py-3.5 rounded-full font-semibold transition-all duration-200 hover:border-white"
                >
                  Explore Events
                </button>
              </div>
              <div className="flex flex-wrap justify-center gap-10 text-sm max-w-2xl mx-auto">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Seamless Registration</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Live Streaming</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-pink-400 rounded-full"></div>
                  <span className="text-gray-300">Ticket Management</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-24 bg-white scroll-reveal">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <div className="relative scroll-reveal">
            <div className="w-full h-80 bg-orange-500/5 rounded-3xl absolute top-4 -left-4"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=400"
                className="rounded-2xl shadow-lg h-64 object-cover w-full transition-transform duration-300 hover:scale-105"
                alt="Event Hall"
              />
              <div className="relative top-12">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=400"
                  className="rounded-2xl shadow-lg h-48 object-cover w-full border-4 border-white transition-transform duration-300 hover:scale-105"
                  alt="Audience"
                />
              </div>
            </div>
            <div className="absolute bottom-10 left-10 bg-pink-500 p-4 rounded-lg shadow-xl cursor-pointer hover:bg-pink-600 transition-all duration-200">
              <Play className="text-white fill-white" size={32} />
            </div>
          </div>

          <div className="scroll-reveal">
            <span className="text-gray-400 font-semibold mb-3 block tracking-wide uppercase text-xs">
              About Our Platform
            </span>
            <h2 className="text-4xl lg:text-5xl font-bold mb-6 text-slate-900 leading-tight">
              Everything You Need to Run World-Class Events
            </h2>
            <p className="text-gray-600 mb-8 leading-relaxed text-lg">
              Our comprehensive platform empowers event organizers to create, manage, and scale professional webinars and conferences. From seamless event creation to real-time attendee management, our solution handles every aspect of your event lifecycle.
            </p>
            <ul className="text-gray-700 space-y-4 mb-10">
              <li className="flex items-start"><span className="text-pink-500 mr-3 font-bold text-lg">✓</span><span>Event creation & management tools</span></li>
              <li className="flex items-start"><span className="text-pink-500 mr-3 font-bold text-lg">✓</span><span>Speaker onboarding & coordination</span></li>
              <li className="flex items-start"><span className="text-pink-500 mr-3 font-bold text-lg">✓</span><span>Automated ticketing & registration</span></li>
              <li className="flex items-start"><span className="text-pink-500 mr-3 font-bold text-lg">✓</span><span>Real-time schedule management</span></li>
              <li className="flex items-start"><span className="text-pink-500 mr-3 font-bold text-lg">✓</span><span>Global attendee access & support</span></li>
            </ul>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden transition-transform duration-200 hover:scale-105"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="avatar"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold transition-transform duration-200 hover:scale-105">
                  15+
                </div>
              </div>
              <span className="font-semibold text-slate-700">Industry Experts</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50 scroll-reveal">
        <div className="text-center mb-20">
          <span className="text-gray-400 font-semibold uppercase text-xs tracking-wider">Platform Capabilities</span>
          <h2 className="text-4xl font-bold mt-4 text-slate-900">
            Everything Needed for Professional Events
          </h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer scroll-reveal">
            <div className="w-14 h-14 bg-pink-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-pink-500 transition-all duration-200">
              <MapPin className="text-pink-500 group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Expert Speakers</h3>
            <p className="text-gray-600 leading-relaxed">
              Curated industry leaders and thought leaders ready to share insights with your audience.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer scroll-reveal">
            <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-orange-500 transition-all duration-200">
              <Clock className="text-orange-500 group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Schedule Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Intuitive tools for managing sessions, timings, and speaker availability across multiple tracks.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer scroll-reveal">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-purple-500 transition-all duration-200">
              <Play className="text-purple-500 group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Live Streaming</h3>
            <p className="text-gray-600 leading-relaxed">
              Seamless HD streaming for global audiences with interactive features and engagement tools.
            </p>
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-200 group cursor-pointer scroll-reveal">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-500 transition-all duration-200">
              <Mail className="text-blue-500 group-hover:text-white transition-colors duration-200" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-slate-900">Ticketing & Registration</h3>
            <p className="text-gray-600 leading-relaxed">
              Automated ticketing, registration workflows, and attendee management all in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 mb-24 relative z-20 scroll-reveal">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-white text-center">
          <div className="bg-pink-500 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer scroll-reveal">
            <h3 className="text-4xl font-bold mb-2">12,000+</h3>
            <p className="text-sm opacity-90 font-medium">Registered Attendees</p>
          </div>
          <div className="bg-orange-500 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer scroll-reveal">
            <h3 className="text-4xl font-bold mb-2">15</h3>
            <p className="text-sm opacity-90 font-medium">Expert Speakers</p>
          </div>
          <div className="bg-[#6d28d9] p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer scroll-reveal">
            <h3 className="text-4xl font-bold mb-2">50+</h3>
            <p className="text-sm opacity-90 font-medium">
              Countries Represented
            </p>
          </div>
          <div className="bg-blue-600 p-10 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer scroll-reveal">
            <h3 className="text-4xl font-bold mb-2">120+</h3>
            <p className="text-sm opacity-90 font-medium">Partner Companies</p>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-24 bg-gradient-to-b from-gray-50 to-gray-100 scroll-reveal">
        <div className="text-center mb-16">
          <span className="text-pink-500 font-semibold text-sm uppercase tracking-wider">Industry Experts</span>
          <h2 className="text-4xl font-bold text-slate-900 mt-4">
            Meet Our Featured Speakers
          </h2>
          <p className="text-gray-600 mt-3 max-w-2xl mx-auto">Join industry leaders and innovators sharing cutting-edge insights</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[
            { name: "Sarah Chen", role: "AI/ML Architect", bio: "10+ years in AI research" },
            { name: "David Kumar", role: "Cloud Solutions Lead", bio: "Enterprise cloud expert" },
            { name: "Alex Rodriguez", role: "DevOps Engineer", bio: "Infrastructure specialist" },
            { name: "Jennifer Lee", role: "Security Expert", bio: "CyberSecurity architect" }
          ].map((speaker, i) => (
            <div key={i} className="group h-full scroll-reveal">
              <div className="relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 h-full flex flex-col">
                {/* Background Accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500"></div>
                
                {/* Speaker Image */}
                <div className="relative pt-8 pb-6 px-6 bg-gradient-to-br from-slate-50 to-gray-50">
                  <div className="relative inline-block mx-auto w-full flex justify-center">
                    <div className="absolute inset-0 w-40 h-40 bg-gradient-to-br from-pink-400/20 to-purple-400/20 rounded-full blur-2xl -z-10 mx-auto"></div>
                    <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-white shadow-xl relative z-10">
                      <img
                        src={`https://i.pravatar.cc/300?img=${i + 50}`}
                        alt={speaker.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Speaker Info */}
                <div className="flex-1 text-center px-6 pb-8 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-slate-900 mt-6 mb-2">{speaker.name}</h3>
                    <div className="inline-block bg-gradient-to-r from-pink-100 to-purple-100 text-pink-700 text-xs font-semibold px-4 py-2 rounded-full mb-4">
                      {speaker.role}
                    </div>
                    <p className="text-gray-600 text-sm">{speaker.bio}</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center space-x-4 mt-8">
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-pink-500 flex items-center justify-center transition-all duration-200 group/social">
                      <Facebook size={16} className="text-gray-600 group-hover/social:text-white transition" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-purple-500 flex items-center justify-center transition-all duration-200 group/social">
                      <Twitter size={16} className="text-gray-600 group-hover/social:text-white transition" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-gray-100 hover:bg-blue-600 flex items-center justify-center transition-all duration-200 group/social">
                      <Linkedin size={16} className="text-gray-600 group-hover/social:text-white transition" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials Carousel */}
      <section className="py-24 bg-white text-center scroll-reveal">
        <span className="text-gray-500 text-sm">Testimonials</span>
        <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-12">
          What Industry Leaders Say
        </h2>

        <div className="max-w-3xl mx-auto px-6">
          <div className="relative min-h-[480px] flex items-center justify-center">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className={`absolute w-full transition-opacity duration-500 ${
                  idx === currentTestimonial ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="bg-white rounded-2xl p-12 shadow-lg">
                  <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-6 border-4 border-pink-100 shadow-md">
                    <img
                      src={`https://i.pravatar.cc/300?img=${testimonial.image}`}
                      alt={testimonial.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-bold text-xl text-slate-800 mb-1">{testimonial.name}</h3>
                  <p className="text-pink-500 text-sm font-semibold mb-4">{testimonial.role}</p>
                  <div className="flex justify-center text-yellow-400 text-base mb-6">
                    {"★".repeat(testimonial.rating)}
                  </div>
                  <p className="text-gray-600 italic leading-relaxed text-lg max-w-2xl mx-auto">
                    "{testimonial.text}"
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-3 mt-12">
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentTestimonial(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                  idx === currentTestimonial
                    ? "bg-pink-500 w-8"
                    : "bg-gray-300 hover:bg-gray-400"
                }`}
                aria-label={`Go to testimonial ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-24 pb-10 scroll-reveal">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-20 mb-20">
          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Stay Updated
            </h3>
            <p className="text-gray-600 mb-8 max-w-sm leading-relaxed">
              Get the latest updates on upcoming webinars, exclusive speaker content, and platform features delivered to your inbox.
            </p>
            <div className="flex bg-white rounded-full p-1.5 shadow-md max-w-md border border-gray-200 hover:shadow-lg transition-shadow duration-300">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-5 py-3 bg-transparent outline-none text-sm"
              />
              <button className="bg-pink-500 text-white rounded-full w-12 h-12 flex items-center justify-center hover:bg-pink-600 transition-all duration-200">
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="flex space-x-5 mt-10">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 cursor-pointer group">
                <Facebook size={18} className="text-slate-700 group-hover:text-pink-500 transition-colors duration-200" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 cursor-pointer group">
                <Twitter size={18} className="text-slate-700 group-hover:text-pink-500 transition-colors duration-200" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 cursor-pointer group">
                <Linkedin size={18} className="text-slate-700 group-hover:text-pink-500 transition-colors duration-200" />
              </div>
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:border-pink-500 hover:bg-pink-50 transition-all duration-200 cursor-pointer group">
                <Instagram size={18} className="text-slate-700 group-hover:text-pink-500 transition-colors duration-200" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-bold text-slate-900 mb-6">
              Quick Links
            </h3>
            <ul className="space-y-4">
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-200">About Us</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-200">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-200">Terms of Service</a></li>
              <li><a href="#" className="text-gray-600 hover:text-pink-500 transition-colors duration-200">Contact Support</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-2 md:mb-0">
            <Logo theme="gradient" className="h-6" />
          </div>
          <div>© 2026 Altrix. All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;