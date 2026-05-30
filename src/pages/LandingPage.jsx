import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Mail, 
  LayoutDashboard, 
  Smartphone, 
  Sliders,
  Star,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

const HomePage = () => {
  // Smooth scroll handler for anchor links
  const handleSmoothScroll = (e, targetId) => {
    e.preventDefault();
    const targetElement = document.getElementById(targetId);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Sticky Navbar */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <span className="text-2xl font-bold text-indigo-600">BookEasy</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a 
                href="#how-it-works" 
                onClick={(e) => handleSmoothScroll(e, 'how-it-works')}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                How It Works
              </a>
              <a 
                href="#features" 
                onClick={(e) => handleSmoothScroll(e, 'features')}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Features
              </a>
              <a 
                href="#pricing" 
                onClick={(e) => handleSmoothScroll(e, 'pricing')}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Pricing
              </a>
              <a 
                href="#faq" 
                onClick={(e) => handleSmoothScroll(e, 'faq')}
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                FAQ
              </a>
            </div>
            
            {/* Navbar Buttons */}
            <div className="flex items-center space-x-4">
              <Link 
                to="/login" 
                className="text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Sign In
              </Link>
              <Link 
                to="/signup" 
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
            Finally, a booking system that makes you look professional — without the tech headache.
          </h1>
          <p className="mt-6 text-xl text-gray-600 max-w-2xl mx-auto">
            Give your clients a simple, branded booking page where they can schedule appointments online 24/7, get instant confirmations, and pay attention to your business instead of your DMs.
          </p>
          <p className="mt-4 text-lg text-indigo-600 font-medium">
            You focus on your work. BookEasy handles the scheduling.
          </p>
          <div className="mt-8">
            <Link 
              to="/signup" 
              className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
            >
              Get Your Booking Page
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Social Proof Bar */}
      <section className="bg-gray-50 border-y border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Star className="w-8 h-8 text-yellow-400 fill-current mb-3" />
              <p className="text-gray-700 italic">“I stopped wasting hours every week replying to booking messages. My clients just book themselves now.”</p>
              <p className="mt-3 font-semibold text-gray-900">— Maria, Hair Stylist</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Star className="w-8 h-8 text-yellow-400 fill-current mb-3" />
              <p className="text-gray-700 italic">“BookEasy made me look way more professional overnight. My clients love the reminders and online scheduling.”</p>
              <p className="mt-3 font-semibold text-gray-900">— Jason, Personal Trainer</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <Star className="w-8 h-8 text-yellow-400 fill-current mb-3" />
              <p className="text-gray-700 italic">“Parents can finally book tutoring sessions without texting me back and forth all day.”</p>
              <p className="mt-3 font-semibold text-gray-900">— Amina, Math Tutor</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">How It Works</h2>
          <p className="mt-4 text-xl text-gray-600">Three simple steps to start booking like a pro</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Set Up Your Profile</h3>
            <p className="text-gray-600">Add your services, availability, pricing, and business details in minutes.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Your Booking Link</h3>
            <p className="text-gray-600">Send your custom booking page to clients through Instagram, WhatsApp, email, or your website.</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-indigo-600">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Get Bookings Automatically</h3>
            <p className="text-gray-600">Clients book online anytime, receive confirmations instantly, and your schedule stays organized.</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Everything you need to manage bookings</h2>
            <p className="mt-4 text-xl text-gray-600">Powerful features that make scheduling effortless</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <LayoutDashboard className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Your Own Branded Booking Page</h3>
              <p className="text-gray-600">A clean, professional page with your business name, services, and availability.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Online Appointment Scheduling</h3>
              <p className="text-gray-600">Clients can book appointments 24/7 without needing to message you first.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Automatic Email Confirmations</h3>
              <p className="text-gray-600">Every booking gets instant confirmation emails so nobody misses the details.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Simple Calendar Management</h3>
              <p className="text-gray-600">View upcoming appointments, stay organized, and manage your schedule from one dashboard.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Smartphone className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mobile-Friendly Experience</h3>
              <p className="text-gray-600">Your booking page looks great on phones, tablets, and desktops.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="bg-indigo-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Sliders className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Service & Availability Controls</h3>
              <p className="text-gray-600">Set your working hours, block unavailable times, and customize your services anytime.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Simple Pricing. No Contracts. No Surprise Fees.</h2>
        </div>
        <div className="flex justify-center">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-indigo-200 p-8 max-w-md w-full transform hover:scale-105 transition-all">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900">Professional Plan</h3>
              <div className="mt-4">
                <span className="text-4xl font-bold text-indigo-600">$150</span>
                <span className="text-gray-600"> One-Time Setup</span>
              </div>
              <div className="mt-2">
                <span className="text-3xl font-bold text-gray-900">+ $39</span>
                <span className="text-gray-600">/month</span>
              </div>
              <p className="mt-4 text-gray-600">We set everything up for you so you can start accepting bookings fast.</p>
            </div>
            <div className="mt-6 space-y-3">
              {[
                "Your own branded booking page",
                "Unlimited bookings",
                "Online appointment scheduling",
                "Email confirmations",
                "Client management dashboard",
                "Mobile-friendly design",
                "Availability & schedule controls",
                "Ongoing support & updates"
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
            <div className="mt-8">
              <Link 
                to="/signup" 
                className="block text-center bg-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-indigo-700 transition-colors"
              >
                Get Your Booking Page
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Do I need technical skills to use BookEasy?</h3>
              <p className="text-gray-600">No. We handle the setup for you, and the dashboard is designed to be simple and easy to manage.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Can I use my booking page on Instagram or WhatsApp?</h3>
              <p className="text-gray-600">Yes. You'll get a custom booking link you can share anywhere.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">What kinds of businesses is BookEasy for?</h3>
              <p className="text-gray-600">BookEasy works great for solo service professionals like hair stylists, barbers, tutors, coaches, personal trainers, nail artists, consultants, and more.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Can clients book appointments at any time?</h3>
              <p className="text-gray-600">Yes. Your booking page works 24/7, even when you're busy or offline.</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <h3 className="text-lg font-semibold mb-2">Is there a contract?</h3>
              <p className="text-gray-600">No long-term contracts. Just a simple monthly subscription after your setup is complete.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="bg-indigo-50 rounded-3xl p-8 md:p-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Stop chasing clients in your DMs. Start getting booked professionally.
          </h2>
          <p className="text-xl text-gray-700 max-w-2xl mx-auto mb-8">
            Your clients already expect online booking. Give them a simple experience that saves you time and helps your business grow.
          </p>
          <Link 
            to="/signup" 
            className="inline-flex items-center bg-indigo-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-indigo-700 transition-all transform hover:scale-105 shadow-lg"
          >
            Get Your Booking Page
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          <p>&copy; 2025 BookEasy. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;