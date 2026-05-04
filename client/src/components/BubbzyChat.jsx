import React, { useState, useRef, useEffect, useCallback } from 'react';

// ─── Rottweiler SVG Icon ──────────────────────────────────────────────────────
const RottweilerIcon = ({ size = 40, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Head base */}
    <ellipse cx="50" cy="52" rx="36" ry="32" fill="#2c1a0e" />
    {/* Forehead highlight */}
    <ellipse cx="50" cy="40" rx="24" ry="18" fill="#3d2410" />
    {/* Tan brow patches */}
    <ellipse cx="38" cy="38" rx="8" ry="5.5" fill="#c8843a" />
    <ellipse cx="62" cy="38" rx="8" ry="5.5" fill="#c8843a" />
    {/* Ears - floppy */}
    <ellipse cx="20" cy="48" rx="11" ry="16" fill="#1a0d05" transform="rotate(-15 20 48)" />
    <ellipse cx="80" cy="48" rx="11" ry="16" fill="#1a0d05" transform="rotate(15 80 48)" />
    {/* Muzzle */}
    <ellipse cx="50" cy="64" rx="20" ry="14" fill="#c8843a" />
    {/* Nose */}
    <ellipse cx="50" cy="58" rx="9" ry="6" fill="#1a0d05" />
    <ellipse cx="47" cy="56.5" rx="2.5" ry="1.5" fill="#3d2410" opacity="0.6" />
    {/* Nostrils */}
    <ellipse cx="46.5" cy="59" rx="2" ry="1.5" fill="#0d0805" />
    <ellipse cx="53.5" cy="59" rx="2" ry="1.5" fill="#0d0805" />
    {/* Mouth line */}
    <path d="M42 65 Q50 70 58 65" stroke="#1a0d05" strokeWidth="1.5" fill="none" strokeLinecap="round" />
    {/* Eyes */}
    <ellipse cx="36" cy="44" rx="7" ry="6.5" fill="#1a0d05" />
    <ellipse cx="64" cy="44" rx="7" ry="6.5" fill="#1a0d05" />
    {/* Iris */}
    <ellipse cx="36" cy="44" rx="4.5" ry="4" fill="#6b3e1a" />
    <ellipse cx="64" cy="44" rx="4.5" ry="4" fill="#6b3e1a" />
    {/* Pupils */}
    <ellipse cx="36.5" cy="44" rx="2.5" ry="2.5" fill="#0a0603" />
    <ellipse cx="64.5" cy="44" rx="2.5" ry="2.5" fill="#0a0603" />
    {/* Eye shine */}
    <ellipse cx="37.5" cy="42.5" rx="1.2" ry="1" fill="white" opacity="0.85" />
    <ellipse cx="65.5" cy="42.5" rx="1.2" ry="1" fill="white" opacity="0.85" />
    {/* Chin tan patch */}
    <ellipse cx="50" cy="74" rx="12" ry="6" fill="#c8843a" />
    {/* Inner ear tan */}
    <ellipse cx="20" cy="50" rx="5" ry="9" fill="#c8843a" opacity="0.35" transform="rotate(-15 20 50)" />
    <ellipse cx="80" cy="50" rx="5" ry="9" fill="#c8843a" opacity="0.35" transform="rotate(15 80 50)" />
  </svg>
);

// ─── Bubbzy Brain — Smart Response Engine ────────────────────────────────────
const QUICK_REPLIES = [
  { label: '🏥 Book a vet', value: 'How do I book a vet appointment?' },
  { label: '📹 Instant consult', value: 'How does instant video consult work?' },
  { label: '🛍️ Pet shop', value: 'What products do you sell?' },
  { label: '🐾 About PawCare', value: 'What is PawCare?' },
];

const RESPONSES = [
  {
    patterns: ['hello', 'hi', 'hey', 'hola', 'namaste', 'good morning', 'good evening', 'sup', 'yo'],
    replies: [
      "Hey there! 🐾 I'm Bubbzy — your PawCare buddy! I'm here to help with anything pet-related. What can I sniff out for you today?",
      "Woof woof! 🐕 Hi there! I'm Bubbzy, your furry assistant at PawCare. Ask me anything about bookings, consults, or our pet shop!",
      "Ruff ruff! 👋 I'm Bubbzy! Super excited to help you out. Need a vet, some pet supplies, or just got questions? I'm all ears (literally)! 🦴",
    ],
  },
  {
    patterns: ['what is pawcare', 'about pawcare', 'tell me about', 'what do you do', 'explain pawcare'],
    replies: [
      "PawCare is Gurugram's premium pet-care platform 🐾\n\n✅ **Book vet appointments** at top clinics\n✅ **Instant video consults** with licensed vets\n✅ **Pet shop** — food, toys, accessories & medicine\n✅ **Real-time vet matching** when your pet needs help NOW\n\nWe're here to make pet parenting stress-free! 🐶🐱",
    ],
  },
  {
    patterns: ['book', 'appointment', 'schedule', 'visit', 'clinic', 'vet appointment'],
    replies: [
      "Booking a vet appointment is super easy! 📅\n\n1️⃣ Go to **Find Vets** in the navigation\n2️⃣ Browse clinics near you in Gurugram\n3️⃣ Click **Book Now** on any clinic card\n4️⃣ Pick a date, time slot & enter your pet's details\n5️⃣ Confirm — done! 🎉\n\nYou can also track all bookings in your **Dashboard → Appointments**.",
    ],
  },
  {
    patterns: ['instant consult', 'video consult', 'teleconsult', 'video call', 'online vet', 'consult now', 'video'],
    replies: [
      "Instant Consult lets you talk to a licensed vet via video within minutes! 📹\n\n**How it works:**\n1️⃣ Go to **Consult** in the nav\n2️⃣ See which vets are **online right now**\n3️⃣ Click **Consult Now** and pay the session fee\n4️⃣ Enter your pet's name & issue\n5️⃣ You'll be matched and connected instantly! 🐾\n\nFees range from ₹500–₹1000 per session.",
    ],
  },
  {
    patterns: ['shop', 'buy', 'product', 'food', 'medicine', 'toy', 'accessory', 'purchase', 'order'],
    replies: [
      "Our Pet Shop has everything your furry friend needs! 🛍️\n\n🍖 **Premium pet food** — Royal Canin, Pedigree & more\n💊 **Medicine** — dewormers, supplements, tick control\n🎾 **Toys** — keep them entertained!\n🎀 **Accessories** — collars, leashes, grooming\n\nVisit the **Shop** tab → Add to cart → Checkout with home delivery! 🚚",
    ],
  },
  {
    patterns: ['cart', 'checkout', 'place order', 'delivery', 'shipping'],
    replies: [
      "To place an order: 🛒\n\n1️⃣ Browse the **Shop** and click **+ Add** on any product\n2️⃣ Click the cart icon in the top right\n3️⃣ Review your items and click **Proceed to Checkout**\n4️⃣ Enter your delivery address\n5️⃣ Click **Place Order** ✅\n\nYou can track your orders in **Dashboard → Orders**!",
    ],
  },
  {
    patterns: ['login', 'sign in', 'sign up', 'register', 'account', 'password'],
    replies: [
      "You can create a free PawCare account in under a minute! 🐾\n\n👉 Click **Let's Go** in the top navigation to register\n👉 Already have an account? Click **Sign In**\n\n**Demo credentials you can try:**\n📧 `riya@pawcare.in`\n🔑 `Password123!`\n\nYour dashboard keeps track of all appointments, orders & consult history!",
    ],
  },
  {
    patterns: ['dashboard', 'my account', 'profile', 'my orders', 'my appointment', 'my bookings'],
    replies: [
      "Your **Dashboard** is your command center! 🐾\n\n**Pet Owner dashboard has:**\n📅 Upcoming & past appointments\n📦 Order history & tracking\n👤 Profile settings (name, phone)\n\n**Vet dashboard has:**\n🟢 Online/Offline toggle for teleconsults\n📋 Today's appointment schedule\n💰 Earnings & session stats\n\nAccess it via **Dashboard** in the nav after logging in!",
    ],
  },
  {
    patterns: ['cancel', 'refund', 'cancellation'],
    replies: [
      "Here's PawCare's cancellation info: ℹ️\n\n📅 **Appointment cancellation:** Cancel pending appointments from your Dashboard or My Appointments page — no charge.\n\n📦 **Order cancellation:** You can cancel orders that are still in 'placed' status from your Orders page.\n\n📹 **Consult cancellation:** Cancel from the Waiting Room before a vet connects. Refunds take 3–5 business days.\n\nNeed more help? Feel free to ask! 🐶",
    ],
  },
  {
    patterns: ['rottweiler', 'your breed', 'what breed', 'what dog', 'bubbzy', 'who are you'],
    replies: [
      "Woof! I'm Bubbzy — a proud Rottweiler! 🐕‍🦺\n\nRottweilers are known for being loyal, protective, and super smart — just like me! I take my job as PawCare's assistant very seriously 😤💼\n\nBut don't let my tough look fool you — I'm a total softie when it comes to helping pet parents like you! 🥰",
    ],
  },
  {
    patterns: ['dog', 'puppy', 'cat', 'kitten', 'bird', 'rabbit', 'pet health', 'sick', 'ill', 'disease', 'symptom'],
    replies: [
      "Oh no, is your furry friend not feeling well? 😟\n\nFor **urgent concerns**, I recommend:\n📹 **Instant Consult** — talk to a licensed vet right now!\n📅 **Book an appointment** at a clinic near you\n\n**Common things vets at PawCare treat:**\n• Skin conditions & allergies\n• Digestion issues\n• Vaccinations & preventive care\n• Dental health\n• Exotic pet care (birds, rabbits)\n\nYour pet's health is our top priority! 🐾",
    ],
  },
  {
    patterns: ['price', 'cost', 'fee', 'how much', 'charge', 'rate', 'rupee', '₹'],
    replies: [
      "Here's a quick price guide at PawCare: 💰\n\n📹 **Instant Teleconsult:** ₹500 – ₹1,000 per session\n📅 **Clinic appointments:** Varies by clinic (typically ₹300–₹800)\n🛍️ **Pet food:** Starting from ₹350\n💊 **Medicine:** Starting from ₹250\n🎾 **Toys:** Starting from ₹199\n\nAll prices are clearly shown before you checkout. No hidden fees! ✅",
    ],
  },
  {
    patterns: ['gurugram', 'gurgaon', 'location', 'where', 'area', 'sector', 'dlf', 'nearby'],
    replies: [
      "PawCare currently serves **Gurugram (Gurgaon)** 📍\n\nWe have vet clinics across:\n• DLF Phase 2, Sector 25\n• Sector 56\n• Golf Course Road, Sector 42\n• And more areas nearby!\n\nUse the **Find Vets** feature — it uses your location to show clinics sorted by distance. 🗺️",
    ],
  },
  {
    patterns: ['razorpay', 'payment', 'upi', 'card', 'net banking', 'pay', 'safe', 'secure'],
    replies: [
      "All payments on PawCare are **100% secure** 🔒\n\n💳 We use **Razorpay** — India's most trusted payment gateway\n\n**Accepted payment methods:**\n• UPI (PhonePe, GPay, Paytm)\n• Debit & Credit Cards\n• Net Banking\n• Wallets\n\nYour payment info is **never stored** on our servers. Safe & encrypted! ✅",
    ],
  },
  {
    patterns: ['thank', 'thanks', 'great', 'awesome', 'helpful', 'good', 'nice', 'love', 'perfect'],
    replies: [
      "Aww, you're making my tail wag! 🐕 So happy I could help!\n\nRemember, I'm always here if you have more questions. Just click the paw icon anytime! 🐾",
      "Woof woof! 🐕 You made Bubbzy very happy! Always here to help, anytime! 🎉",
      "Yay! 🎊 That's what I'm here for! Let me know if there's anything else I can sniff out for you! 🐶",
    ],
  },
  {
    patterns: ['bye', 'goodbye', 'see you', 'later', 'cya', 'take care'],
    replies: [
      "Bye bye! 👋 Take good care of your furry babies! See you next time! 🐾\n\n*(I'll be right here in the corner if you need me)* 🐕",
      "Aww, so soon? 🥺 Come back anytime — I'll be here wagging my tail! Bye! 👋🐕",
    ],
  },
  {
    patterns: ['help', 'what can you do', 'options', 'menu', 'features'],
    replies: [
      "Here's what I can help you with! 🐕\n\n🏥 **Book vet appointments** near you\n📹 **Instant video consult** with online vets\n🛍️ **Pet shop** — food, medicine, toys\n📦 **Track your orders**\n💰 **Pricing info**\n📍 **Clinic locations** in Gurugram\n\nJust type your question and I'll fetch the answer! 🦴",
    ],
  },
];

const FALLBACK = [
  "Hmm, that's a tricky one! 🤔 I'm still learning!\n\nHere's what I *can* help with:\n• Booking vet appointments\n• Instant video consults\n• Our pet shop\n• Orders & tracking\n\nOr try one of the quick options below! 🐾",
  "Woof! 🐕 I'm not sure about that one, but our team definitely can help! For now, try asking me about appointments, the shop, or instant consults!",
  "That's beyond my sniffing range! 😄 But I'm great at helping with PawCare features like booking vets, teleconsults, and pet products. Give those a try!",
];

function getBubbzyReply(userMsg) {
  const lower = userMsg.toLowerCase().trim();

  for (const entry of RESPONSES) {
    if (entry.patterns.some((p) => lower.includes(p))) {
      const arr = entry.replies;
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }

  return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
}

// ─── Markdown-lite renderer ───────────────────────────────────────────────────
function renderMessage(text) {
  // Convert **bold**, newlines, and bullet points
  return text
    .split('\n')
    .map((line, i) => {
      const boldLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      if (line.startsWith('•') || line.match(/^\d️⃣/)) {
        return `<div key="${i}" style="margin:2px 0">${boldLine}</div>`;
      }
      return `<div key="${i}" style="margin:1px 0">${boldLine}</div>`;
    })
    .join('');
}

// ─── Main Bubbzy Chat Component ───────────────────────────────────────────────
const BubbzyChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      from: 'bot',
      text: "Woof! I'm **Bubbzy** 🐕 — your PawCare assistant!\n\nAsk me anything about vet bookings, instant consults, our pet shop, or anything else! I'm here to help! 🐾",
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [shake, setShake] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const msgIdRef = useRef(2);

  useEffect(() => {
    if (open) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open, messages]);

  // Pulse the icon every 20 seconds to attract attention when closed
  useEffect(() => {
    if (open) return;
    const interval = setInterval(() => {
      setShake(true);
      setTimeout(() => setShake(false), 800);
    }, 20000);
    return () => clearInterval(interval);
  }, [open]);

  const sendMessage = useCallback(
    (text) => {
      const userText = (text || input).trim();
      if (!userText) return;

      const userMsg = { id: msgIdRef.current++, from: 'user', text: userText, ts: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setTyping(true);

      const delay = 700 + Math.random() * 700;
      setTimeout(() => {
        const reply = getBubbzyReply(userText);
        const botMsg = { id: msgIdRef.current++, from: 'bot', text: reply, ts: new Date() };
        setMessages((prev) => [...prev, botMsg]);
        setTyping(false);
      }, delay);
    },
    [input]
  );

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* ── Chat Window ── */}
      <div
        className={`fixed bottom-24 right-4 sm:right-6 z-50 w-[340px] sm:w-[380px] transition-all duration-300 ease-out ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-6 pointer-events-none'
        }`}
        style={{ maxHeight: '580px' }}
      >
        <div className="bg-white rounded-3xl shadow-2xl border border-stone-100 overflow-hidden flex flex-col"
          style={{ height: '580px' }}>

          {/* Header */}
          <div className="bg-paw-teal px-5 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <RottweilerIcon size={38} />
              </div>
              <div>
                <p className="text-white font-black text-base leading-tight">Bubbzy</p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <p className="text-white/75 text-xs font-medium">PawCare Assistant · Online</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-8 h-8 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center text-white text-lg transition-colors"
            >
              ✕
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-stone-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'} gap-2`}
              >
                {msg.from === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-paw-teal flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm overflow-hidden">
                    <RottweilerIcon size={30} />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.from === 'user'
                      ? 'bg-paw-teal text-white rounded-tr-sm font-medium'
                      : 'bg-white text-paw-teal border border-stone-100 rounded-tl-sm font-medium'
                  }`}
                  dangerouslySetInnerHTML={{ __html: renderMessage(msg.text) }}
                />
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-paw-teal flex items-center justify-center flex-shrink-0 overflow-hidden shadow-sm">
                  <RottweilerIcon size={30} />
                </div>
                <div className="bg-white border border-stone-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map((i) => (
                      <span
                        key={i}
                        className="w-2 h-2 rounded-full bg-paw-teal/40 animate-bounce"
                        style={{ animationDelay: `${i * 0.15}s`, animationDuration: '0.8s' }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick Replies */}
          <div className="px-3 pt-2 flex gap-2 flex-wrap flex-shrink-0 bg-white border-t border-stone-100">
            {QUICK_REPLIES.map((qr) => (
              <button
                key={qr.value}
                onClick={() => sendMessage(qr.value)}
                className="px-3 py-1.5 bg-stone-50 hover:bg-paw-teal hover:text-white text-stone-600 border border-stone-200 rounded-full text-xs font-bold transition-all duration-200 mb-1"
              >
                {qr.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="flex-shrink-0 p-3 bg-white flex items-center gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask Bubbzy anything... 🐾"
              className="flex-1 px-4 py-2.5 bg-stone-50 border border-stone-200 rounded-full text-sm text-paw-teal placeholder-stone-400 focus:outline-none focus:border-paw-teal/50 focus:ring-2 focus:ring-paw-teal/10 transition-all font-medium"
              disabled={typing}
            />
            <button
              onClick={() => sendMessage()}
              disabled={!input.trim() || typing}
              className="w-10 h-10 bg-paw-teal hover:bg-opacity-90 disabled:bg-stone-200 disabled:text-stone-400 text-white rounded-full flex items-center justify-center transition-all flex-shrink-0 shadow-md"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Trigger Button ── */}
      <button
        id="bubbzy-chat-btn"
        onClick={() => { setOpen((o) => !o); setShake(false); }}
        className={`fixed bottom-6 right-4 sm:right-6 z-50 group transition-all duration-300 ${
          shake ? 'animate-bounce' : ''
        }`}
        aria-label="Open Bubbzy chat assistant"
      >
        {/* Glow ring */}
        <span className="absolute inset-0 rounded-2xl bg-paw-teal opacity-20 scale-110 group-hover:scale-125 group-hover:opacity-30 transition-all duration-300 pointer-events-none" />

        {/* Main button */}
        <div className={`relative w-16 h-16 rounded-2xl bg-paw-teal shadow-xl shadow-paw-teal/30 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-paw-teal/50 ${
          open ? 'rotate-0' : ''
        }`}>
          {open ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          ) : (
            <RottweilerIcon size={44} />
          )}
        </div>

        {/* "Chat" label on hover */}
        <span className="absolute -top-9 left-1/2 -translate-x-1/2 bg-paw-teal text-white text-xs font-bold px-3 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 whitespace-nowrap shadow-md pointer-events-none">
          Chat with Bubbzy!
        </span>

        {/* Notification dot */}
        {!open && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-paw-orange rounded-full border-2 border-paw-cream flex items-center justify-center">
            <span className="w-2 h-2 rounded-full bg-paw-orange animate-ping absolute" />
          </span>
        )}
      </button>

      {/* Keyframe for chat-slide */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
};

export default BubbzyChat;
