import React from "react";
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

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="font-sans text-slate-800 w-full overflow-x-hidden">
      {/* Navbar */}
      <nav className="absolute top-0 w-full z-50 flex justify-between items-center px-8 py-6 text-white max-w-7xl left-1/2 -translate-x-1/2">
        <div className="text-2xl font-bold uppercase tracking-widest">
          Logo Here
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium items-center">
          <a href="#" className="hover:text-pink-500">
            Home
          </a>
          <a href="#" className="hover:text-pink-500">
            About us
          </a>
          <a href="#" className="hover:text-pink-500">
            Events
          </a>
          <a href="#" className="hover:text-pink-500">
            Speakers
          </a>
          <a href="#" className="hover:text-pink-500">
            Contact
          </a>
          <button
            onClick={() => navigate("/auth")} // Goes to auth first
            className="border border-white px-6 py-2 rounded-full hover:bg-pink-600 hover:border-pink-600 transition"
          >
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative bg-[#1e1b4b] text-white min-h-screen flex items-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#1e1b4b] via-[#2e1065] to-[#db2777] opacity-80"></div>
        <div className="absolute top-20 left-10 opacity-20">
          <div className="grid grid-cols-6 gap-2">
            {[...Array(36)].map((_, i) => (
              <div key={i} className="w-1 h-1 bg-white rounded-full"></div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mt-20">
          <div>
            <span className="text-pink-500 font-bold tracking-widest text-sm mb-2 block">
              UPCOMING NEW EVENT 2024
            </span>
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              WORLD BIGGEST <br /> WEBINAR
            </h1>
            <p className="text-gray-300 mb-8 max-w-md">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s.
            </p>
            <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full font-semibold transition shadow-lg shadow-pink-500/30">
              Get Tickets
            </button>
          </div>
          <div className="relative">
            {/* Pink Background Shape */}
            <div className="absolute -top-10 -right-20 w-[120%] h-[120%] bg-gradient-to-b from-pink-500 to-purple-600 rounded-l-full -z-10 opacity-90"></div>
            <img
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800"
              alt="Speaker"
              className="relative z-10 w-full max-w-md mx-auto object-cover rounded-b-full mask-image-gradient"
            />
            <div className="absolute bottom-10 right-0 opacity-50">
              <div className="grid grid-cols-6 gap-2">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 h-1.5 bg-white rounded-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* About Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative">
            <div className="w-full h-80 bg-orange-500/10 rounded-3xl absolute top-4 -left-4"></div>
            <div className="relative z-10 grid grid-cols-2 gap-4">
              <img
                src="https://images.unsplash.com/photo-1544531586-fde5298cdd40?auto=format&fit=crop&q=80&w=400"
                className="rounded-2xl shadow-lg h-64 object-cover w-full"
                alt="Event Hall"
              />
              <div className="relative top-12">
                <img
                  src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&q=80&w=400"
                  className="rounded-2xl shadow-lg h-48 object-cover w-full border-4 border-white"
                  alt="Audience"
                />
              </div>
            </div>
            <div className="absolute bottom-10 left-10 bg-pink-500 p-4 rounded-lg shadow-xl cursor-pointer hover:scale-105 transition">
              <Play className="text-white fill-white" size={32} />
            </div>
          </div>

          <div>
            <span className="text-gray-500 font-semibold mb-2 block">
              About Us
            </span>
            <h2 className="text-4xl font-bold mb-6 text-slate-900">
              Know More About Event
            </h2>
            <p className="text-gray-500 mb-6 leading-relaxed">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s, when an unknown printer took a galley of
              type and scrambled it to make a type specimen book.
            </p>
            <div className="flex items-center space-x-4">
              <div className="flex -space-x-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gray-300 overflow-hidden"
                  >
                    <img
                      src={`https://i.pravatar.cc/100?img=${i + 10}`}
                      alt="avatar"
                    />
                  </div>
                ))}
                <div className="w-10 h-10 rounded-full border-2 border-white bg-[#1e1b4b] text-white flex items-center justify-center text-xs font-bold">
                  5+
                </div>
              </div>
              <span className="font-semibold text-slate-700">Speakers</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="text-center mb-16">
          <span className="text-gray-500 font-semibold">Event Features</span>
          <h2 className="text-3xl font-bold mt-2">
            Unifying For A Better World
          </h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="bg-white p-8 rounded-xl shadow-sm hover:shadow-xl transition group"
            >
              <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center mb-6 group-hover:bg-pink-500 transition duration-300">
                <MapPin className="text-pink-500 group-hover:text-white" />
              </div>
              <h3 className="text-xl font-bold mb-3">Speaker Lineup</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                Lorem Ipsum is simply dummy text of the printing and typesetting
                industry.
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Schedule Section */}
      <section className="py-24 bg-[#1e1b4b] text-white">
        <div className="text-center mb-16">
          <span className="text-gray-400 text-sm uppercase tracking-wider">
            Schedule Of Event
          </span>
          <h2 className="text-3xl font-bold mt-2">
            List Of Events Planned In this Conference
          </h2>
        </div>

        <div className="max-w-5xl mx-auto px-6">
          {[1, 2, 3, 4, 5].map((item, idx) => (
            <div
              key={idx}
              className={`flex flex-col md:flex-row items-center justify-between py-8 ${
                idx !== 4 ? "border-b border-dashed border-gray-700" : ""
              }`}
            >
              <div className="flex items-center space-x-6 w-full md:w-auto mb-4 md:mb-0">
                <div className="text-center">
                  <span className="text-4xl font-bold block">15</span>
                  <span className="text-sm text-gray-400">
                    February
                    <br />
                    2024
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">Event Name Here</h3>
                  <div className="flex space-x-4 text-xs text-gray-400">
                    <span className="flex items-center">
                      <MapPin size={14} className="mr-1 text-pink-500" /> 135 W,
                      46nd Street, New York
                    </span>
                    <span className="flex items-center">
                      <Clock size={14} className="mr-1 text-pink-500" /> 9:15am
                      - 2:15pm
                    </span>
                  </div>
                </div>
              </div>
              <button className="bg-gradient-to-r from-pink-500 to-purple-600 px-8 py-2 rounded-full text-sm font-semibold hover:shadow-[0_0_15px_rgba(236,72,153,0.5)] transition w-full md:w-auto">
                Get Tickets
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 mb-20 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-white text-center">
          <div className="bg-pink-500 p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold mb-1">10.000</h3>
            <p className="text-xs opacity-90">Conference tickets confirmed</p>
          </div>
          <div className="bg-orange-500 p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold mb-1">8+</h3>
            <p className="text-xs opacity-90">Powered partners speakers</p>
          </div>
          <div className="bg-[#6d28d9] p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold mb-1">40+</h3>
            <p className="text-xs opacity-90">
              Participants from different countries
            </p>
          </div>
          <div className="bg-blue-600 p-8 rounded-lg shadow-lg">
            <h3 className="text-3xl font-bold mb-1">100+</h3>
            <p className="text-xs opacity-90">Sponsor of big company</p>
          </div>
        </div>
      </section>

      {/* Speakers Section */}
      <section className="py-20 bg-gray-50/50">
        <div className="text-center mb-16">
          <span className="text-gray-500 text-sm">Event Speakers</span>
          <h2 className="text-3xl font-bold text-slate-900 mt-2">
            Meet Our Speakers
          </h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="text-center group">
              <div className="relative inline-block mb-6">
                <div className="absolute inset-0 border border-dashed border-gray-300 rounded-full scale-110"></div>
                <div className="absolute inset-0 border border-gray-200 rounded-full scale-125"></div>
                <div className="w-32 h-32 rounded-full overflow-hidden mx-auto relative z-10">
                  <img
                    src={`https://i.pravatar.cc/300?img=${i + 50}`}
                    alt="Speaker"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              <div className="flex justify-center space-x-3 mb-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <Facebook
                  size={16}
                  className="text-gray-400 hover:text-pink-500 cursor-pointer"
                />
                <Twitter
                  size={16}
                  className="text-gray-400 hover:text-pink-500 cursor-pointer"
                />
                <Linkedin
                  size={16}
                  className="text-gray-400 hover:text-pink-500 cursor-pointer"
                />
              </div>

              <h3 className="text-xl font-bold text-slate-800">Thomas</h3>
              <p className="text-gray-500 text-sm">Lorem Ipsum</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing Table */}
      <section className="bg-[#1e1b4b] py-24 relative">
        <div className="text-center mb-16 text-white">
          <span className="text-gray-300 text-sm">Pricing Table</span>
          <h2 className="text-3xl font-bold mt-2">Choose Your Tickets</h2>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
          {["Basic Pass", "Standard Pass", "Premium Pass"].map((plan, idx) => (
            <div
              key={idx}
              className={`${
                idx === 1
                  ? "bg-pink-600 scale-105 z-10 shadow-2xl"
                  : "bg-pink-500"
              } text-white p-10 rounded-xl text-center flex flex-col items-center transition duration-300 hover:scale-105`}
            >
              <div
                className={`bg-white text-slate-900 px-6 py-2 rounded-lg font-bold mb-6 text-sm ${
                  idx === 1 ? "bg-yellow-400" : ""
                }`}
              >
                {plan}
              </div>
              <div className="text-4xl font-bold mb-8">$39.00</div>
              <div className="space-y-4 mb-10 text-xs opacity-90 leading-relaxed">
                <p>Lorem Ipsum is simply dummy text</p>
                <p>of the printing and typesetting</p>
                <p>industry. Lorem Ipsum has been</p>
                <p>the industry's standard</p>
              </div>
              <button className="border border-white/50 hover:bg-white hover:text-pink-600 text-white px-10 py-2 rounded-full text-sm transition mt-auto">
                Register
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 bg-white text-center">
        <span className="text-gray-500 text-sm">Testimonials</span>
        <h2 className="text-3xl font-bold text-slate-900 mt-2 mb-12">
          Customer Say About us
        </h2>

        <div className="max-w-2xl mx-auto px-6">
          <div className="bg-white relative">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-4 border-4 border-gray-100 shadow-sm">
              <img
                src="https://i.pravatar.cc/300?img=12"
                alt="Thomas"
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Thomas</h3>
            <div className="flex justify-center text-orange-400 text-sm mb-6 mt-2">
              {"★★★★★"}
            </div>
            <p className="text-gray-500 italic leading-relaxed">
              "Lorem Ipsum is simply dummy text of the printing and typesetting
              industry. Lorem Ipsum has been the industry's standard dummy text
              ever since the 1500s"
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 gap-16 mb-16">
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Ready to Get Started
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm">
              Lorem Ipsum is simply dummy text of the printing and typesetting
              industry.
            </p>
            <div className="flex bg-white rounded-full p-1 shadow-md max-w-md border border-gray-200">
              <input
                type="text"
                placeholder="Enter Email Address"
                className="flex-1 px-4 py-2 bg-transparent outline-none text-sm"
              />
              <button className="bg-pink-500 text-white rounded-full w-10 h-10 flex items-center justify-center hover:bg-pink-600">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex space-x-4 mt-8">
              <Facebook size={18} className="text-slate-800" />
              <Twitter size={18} className="text-slate-800" />
              <Linkedin size={18} className="text-slate-800" />
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-6">
              Frequently Asked Question
            </h3>
            <ul className="space-y-6">
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="flex justify-between items-center text-gray-500 text-sm hover:text-pink-500 cursor-pointer border-b border-gray-200 pb-2"
                >
                  <span>Lorem Ipsum is simply dummy text of the</span>
                  <ArrowRight size={14} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
          <div className="font-bold text-slate-800 mb-2 md:mb-0">
            Publish Ninja
          </div>
          <div>© 2024, Publish Ninja All Rights Reserved.</div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
