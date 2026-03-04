"use client";

import { useState, useEffect, Fragment } from "react";
import Image from "next/image";
import Link from "next/link";

// ──────────────────────────────────────────────
// Content (Arabic + English)
// ──────────────────────────────────────────────
const content = {
  ar: {
    dir: "rtl",
    lang: "ar",
    nav: {
      services: "خدماتنا",
      whyUs: "عن الشركة",
      howItWorks: "كيف يعمل",
      contact: "تواصل معنا",
      login: "تسجيل الدخول",
      langSwitch: "EN",
    },
    hero: {
      label: "شريكك العالمي في الشحن",
      h1a: "تتبع شحناتك،",
      h1b: "بكل سهولة",
      sub: "شركة الولاء تستلم وتشحن بضاعتك من الصين، دبي، أمريكا وتركيا إلى ليبيا. سجّل دخولك وتابع شحناتك في الوقت الفعلي.",
      cta: "تتبع شحنتك",
      secondary: "تعرف علينا أكثر",
    },
    stats: [
      { n: "+10,000", l: "طلب مكتمل" },
      { n: "+500", l: "عميل راضٍ" },
      { n: "4", l: "مناطق شحن" },
      { n: "99%", l: "رضا العملاء" },
    ],
    services: {
      title: "خدماتنا",
      sub: "نقدم حلول شحن متكاملة من أهم المناطق الاقتصادية في العالم",
      items: [
        { e: "", tag: "الأسرع", t: "شحن جوي", d: "توصيل سريع خلال 7-14 يوم من الصين وتركيا ودبي وأمريكا إلى ليبيا." },
        { e: "", tag: "الأوفر", t: "شحن بحري", d: "حلول اقتصادية للبضائع الكبيرة والحاويات بأسعار تنافسية." },
        { e: "", tag: "الأكثر طلباً", t: "الصين", d: "شراء واستيراد مباشر من أكبر المصانع والأسواق الصينية." },
        { e: "", tag: "مميز", t: "دبي", d: "إعادة تصدير وشحن من مركز التجارة العالمي في دبي." },
        { e: "", tag: "جديد", t: "أمريكا", d: "استيراد من الولايات المتحدة مع خدمة عنوان مجاني." },
        { e: "", tag: "مميز", t: "تركيا", d: "شحن الملابس والمنتجات التركية بأسعار مناسبة وجودة عالية." },
      ],
    },
    why: {
      title: "لماذا تختار الولاء؟",
      sub: "نلتزم بتقديم أعلى معايير الجودة والخدمة في كل شحنة",
      items: [
        { e: "", t: "سرعة فائقة", d: "أقصر أوقات التسليم في المنطقة مع متابعة لحظة بلحظة." },
        { e: "", t: "أمان تام", d: "شحناتك محمية بالكامل، ونضمن وصولها سليمة." },
        { e: "", t: "أسعار تنافسية", d: "أفضل الأسعار مع أعلى جودة خدمة بدون رسوم خفية." },
        { e: "", t: "تتبع فوري", d: "تابع شحنتك في الوقت الحقيقي عبر منصتنا الذكية." },
      ],
    },
    how: {
      title: "كيف يعمل النظام؟",
      sub: "ثلاث خطوات بسيطة لاستلام طلبك",
      steps: [
        { n: "01", t: "تواصل معنا", d: "تواصل مع فريقنا وأرسل تفاصيل الطلب الذي تريد شراءه وشحنه." },
        { n: "02", t: "نشتري ونشحن", d: "فريقنا يتولى الشراء واستلام البضاعة وشحنها بأسرع الطرق المتاحة." },
        { n: "03", t: "تتبع شحنتك", d: "تصلك إشعارات فورية كل خطوة، وتتابع وصول بضاعتك حتى تستلمها في ليبيا." },
      ],
    },
    cta: {
      t: "سجّل وتابع شحناتك",
      s: "الفريق يُعدّ طلباتك، وأنت تراقب كل خطوة في الوقت الفعلي",
   
    },
    footer: {
      about: "شركة الولاء الدائم للشحن الجوي والبحري — نربط ليبيا بالعالم.",
      links: "روابط سريعة",
      contact: "تواصل معنا",
      phone: "+218 92‑1911999",
      email: "info@fll.com.ly",
      rights: "© 2026 شركة الولاء الدائم. جميع الحقوق محفوظة.",
    },
  },
  en: {
    dir: "ltr",
    lang: "en",
    nav: {
      services: "Services",
      whyUs: "About",
      howItWorks: "How It Works",
      contact: "Contact",
      login: "Login",
      langSwitch: "AR",
    },
    hero: {
      label: "Your Global Shipping Partner",
      h1a: "Track Your Shipments,",
      h1b: "Effortlessly",
      sub: "Alwala handles everything — from China, Dubai, USA & Turkey to Libya. Log in and track your shipments in real time.",
      cta: "Track My Shipment",
      secondary: "Learn More",
    },
    stats: [
      { n: "10,000+", l: "Shipments" },
      { n: "500+", l: "Happy Clients" },
      { n: "4", l: "Regions" },
      { n: "99%", l: "Satisfaction" },
    ],
    services: {
      title: "Our Services",
      sub: "Comprehensive shipping solutions from the world's most important economic regions",
      items: [
        { e: "", tag: "Fastest", t: "Air Freight", d: "Fast delivery within 7-14 days from China, Turkey, Dubai & USA to Libya." },
        { e: "", tag: "Best Value", t: "Sea Freight", d: "Economical solutions for bulk goods and containers at competitive prices." },
        { e: "", tag: "Most Popular", t: "China", d: "Direct purchasing and importing from China's largest factories and markets." },
        { e: "", tag: "Featured", t: "Dubai", d: "Re-export and shipping from Dubai, the global trade hub." },
        { e: "", tag: "New", t: "USA", d: "Import from the United States with a free US address service." },
        { e: "", tag: "Featured", t: "Turkey", d: "Ship Turkish clothing and products at affordable prices with high quality." },
      ],
    },
    why: {
      title: "Why Choose Alwala?",
      sub: "We are committed to delivering the highest standards of quality and service in every shipment",
      items: [
        { e: "", t: "Lightning Fast", d: "Shortest delivery times in the region with real-time tracking." },
        { e: "", t: "Fully Secure", d: "Your shipments are fully protected. We guarantee safe delivery." },
        { e: "", t: "Best Prices", d: "Competitive prices with top-quality service and no hidden fees." },
        { e: "", t: "Live Tracking", d: "Track your shipment in real time via our smart platform." },
      ],
    },
    how: {
      title: "How It Works",
      sub: "Three simple steps to receive your order",
      steps: [
        { n: "01", t: "Contact Us", d: "Reach out to our team and send details of the item you want to buy and ship." },
        { n: "02", t: "We Buy & Ship", d: "Our team handles the purchase, receives the goods, and ships them via the fastest route." },
        { n: "03", t: "Track It Live", d: "Get instant notifications at every step and track your shipment until it arrives in Libya." },
      ],
    },
    cta: {
      t: "Login & Track Your Shipments",
      s: "Your team handles the shipping — you just sit back and track every step",
      btn: "Login Now",
    },
    footer: {
      about: "Alwala International Shipping — Connecting Libya to global markets.",
      links: "Quick Links",
      contact: "Contact Us",
      phone: "+218 92‑1911999",
      email: "info@fll.com.ly",
      rights: "© 2026 Alwala International Shipping. All rights reserved.",
    },
  },
};

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────
export default function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const c = content[lang];
  const isRtl = lang === "ar";

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <div dir={c.dir} lang={c.lang} className="lp" style={{ fontFamily: "'Almarai','Inter',sans-serif" }}>
      <style>{css}</style>

      {/* JSON-LD */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "LocalBusiness",
        name: "شركة الولاء الدائم للشحن",
        alternateName: "Alwala International Shipping",
        description: "شركة شحن جوي وبحري من الصين، دبي، أمريكا وتركيا إلى ليبيا",
        url: "https://alwala-shipping.com",
        telephone: "+218910000000",
        email: "info@alwala-shipping.com",
        areaServed: "LY",
      }) }} />

      {/* ── NAV ───────────────────────────────── */}
      <header className={`lp-nav ${scrolled ? "lp-nav--scrolled" : ""}`}>
        <div className="lp-wrap lp-nav__row">
          <div className="lp-nav__logo">
            <Image src="/photos/logo-without-bg.png" alt="الولاء" width={40} height={40} style={{ objectFit: "contain" }} priority />
            <span className="lp-nav__name">{isRtl ? "شركة الولاء الدائم" : "Alwala Shipping"}</span>
          </div>
          <nav className="lp-nav__links" aria-label="navigation">
            <a href="#services">{c.nav.services}</a>
            <a href="#why">{c.nav.whyUs}</a>
            <a href="#how">{c.nav.howItWorks}</a>
            <a href="#contact">{c.nav.contact}</a>
          </nav>
          <div className="lp-nav__right">
            <button onClick={() => setLang(l => l === "ar" ? "en" : "ar")} className="lp-lang">{c.nav.langSwitch}</button>
          </div>
          <button className="lp-burger" onClick={() => setMenuOpen(!menuOpen)} aria-label="menu" style={{marginLeft: 'auto'}}>
            <span/><span/><span/>
          </button>
        </div>
        {menuOpen && (
          <div className="lp-mob">
            <a href="#services" onClick={() => setMenuOpen(false)}>{c.nav.services}</a>
            <a href="#why" onClick={() => setMenuOpen(false)}>{c.nav.whyUs}</a>
            <a href="#how" onClick={() => setMenuOpen(false)}>{c.nav.howItWorks}</a>
            <a href="#contact" onClick={() => setMenuOpen(false)}>{c.nav.contact}</a>
            <div className="lp-mob__actions">
              <button onClick={() => { setLang(l => l === "ar" ? "en" : "ar"); setMenuOpen(false); }} className="lp-lang">{c.nav.langSwitch}</button>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ──────────────────────────────── */}
      <section className="lp-hero" aria-labelledby="hero-h1">
        {/* Background pattern */}
        <div className="lp-hero__bg" aria-hidden="true">
          <div className="lp-hero__dot-grid"/>
        </div>

        <div className="lp-wrap lp-hero__layout">
          {/* Left: Text */}
          <div className="lp-hero__text">
            <span className="lp-chip">{c.hero.label}</span>
            <h1 id="hero-h1" className="lp-hero__h1">
              <span className="lp-hero__h1a">{c.hero.h1a}</span><br/>
              <span className="lp-hero__h1b">{c.hero.h1b}</span>
            </h1>
            <p className="lp-hero__sub">{c.hero.sub}</p>
            <div className="lp-hero__btns">
              <a href="#" className="lp-store-btn" aria-label="Google Play">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M3 20.5v-17c0-.83 1-.97 1.5-.5L20 12 4.5 21c-.5.47-1.5.33-1.5-.5z"/></svg>
                <div>
                  <div className="lp-store-btn__small">{isRtl ? "تحميل من" : "Get it on"}</div>
                  <div className="lp-store-btn__big">Google Play</div>
                </div>
              </a>
              <a href="#" className="lp-store-btn" aria-label="App Store">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
                <div>
                  <div className="lp-store-btn__small">{isRtl ? "تحميل من" : "Download on the"}</div>
                  <div className="lp-store-btn__big">App Store</div>
                </div>
              </a>
            </div>

            {/* Stat strip */}
            <div className="lp-stats" role="list">
              {c.stats.map(s => (
                <div key={s.l} className="lp-stat" role="listitem">
                  <strong className="lp-stat__n">{s.n}</strong>
                  <span className="lp-stat__l">{s.l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Visual card stack */}
          <div className="lp-hero__visual" aria-hidden="true">
            <div className="lp-hero__card lp-hero__card--main">
              <div className="lp-hero__card-header">
                <div className="lp-hero__card-dot lp-hero__card-dot--g"/>
                <div className="lp-hero__card-dot lp-hero__card-dot--y"/>
                <div className="lp-hero__card-dot lp-hero__card-dot--r"/>
              </div>
              <div className="lp-hero__card-body">
                <div className="lp-hero__card-row">
                  <span className="lp-hero__card-label">{isRtl ? "رقم التتبع" : "Tracking No."}</span>
                  <span className="lp-hero__card-val lp-hero__card-val--blue">TRK-KO219-2025</span>
                </div>
                <div className="lp-hero__card-row">
                  <span className="lp-hero__card-label">{isRtl ? "المنطقة" : "Region"}</span>
                  <span className="lp-hero__card-val">🇨🇳 {isRtl ? "الصين" : "China"}</span>
                </div>
                <div className="lp-hero__card-row">
                  <span className="lp-hero__card-label">{isRtl ? "الحالة" : "Status"}</span>
                  <span className="lp-hero__card-badge">{isRtl ? "قيد الشحن" : "In Transit"}</span>
                </div>
                <div className="lp-hero__card-row">
                  <span className="lp-hero__card-label">{isRtl ? "الوزن" : "Weight"}</span>
                  <span className="lp-hero__card-val">3.2 kg</span>
                </div>
                <div className="lp-hero__progress-wrap">
                  <div className="lp-hero__progress-bar">
                    <div className="lp-hero__progress-fill" style={{width: "65%"}}/>
                  </div>
                  <span className="lp-hero__progress-label">65%</span>
                </div>
              </div>
            </div>
            {/* Floating mini cards */}
            <div className="lp-hero__mini lp-hero__mini--1">
              <span>✈️</span>
              <div>
                <div className="lp-hero__mini-t">{isRtl ? "شحن جوي سريع" : "Air Freight"}</div>
                <div className="lp-hero__mini-s">{isRtl ? "7-14 يوم" : "7-14 days"}</div>
              </div>
            </div>
            <div className="lp-hero__mini lp-hero__mini--2">
              <span>📦</span>
              <div>
                <div className="lp-hero__mini-t">{isRtl ? "ضمان التسليم" : "Guaranteed"}</div>
                <div className="lp-hero__mini-s">100%</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── SERVICES ──────────────────────────── */}
      <section id="services" className="lp-section" aria-labelledby="srv-h2">
        <div className="lp-wrap">
          <div className="lp-section-hd">
            <div className="lp-section-eyebrow">{c.services.title}</div>
            <h2 id="srv-h2">{c.services.sub}</h2>
          </div>
          {/* Bento grid */}
          <div className="lp-bento">
            {/* Air Freight — wide hero card */}
            <article className="lp-bento__card lp-bento__card--wide lp-bento__card--navy">
              <span className="lp-bento__bg-label">AIR</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag lp-bento__tag--gold">{c.services.items[0].tag}</span>
                <h3 className="lp-bento__title">{c.services.items[0].t}</h3>
                <p className="lp-bento__desc">{c.services.items[0].d}</p>
              </div>
              <div className="lp-bento__deco">✈</div>
            </article>

            {/* Sea Freight */}
            <article className="lp-bento__card lp-bento__card--sm">
              <span className="lp-bento__bg-label">SEA</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag">{c.services.items[1].tag}</span>
                <h3 className="lp-bento__title lp-bento__title--dark">{c.services.items[1].t}</h3>
                <p className="lp-bento__desc lp-bento__desc--dark">{c.services.items[1].d}</p>
              </div>
            </article>

            {/* China */}
            <article className="lp-bento__card lp-bento__card--sm lp-bento__card--gold">
              <span className="lp-bento__bg-label">CN</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag lp-bento__tag--light">{c.services.items[2].tag}</span>
                <h3 className="lp-bento__title">{c.services.items[2].t}</h3>
                <p className="lp-bento__desc">{c.services.items[2].d}</p>
              </div>
            </article>

            {/* Dubai */}
            <article className="lp-bento__card lp-bento__card--sm">
              <span className="lp-bento__bg-label">DXB</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag">{c.services.items[3].tag}</span>
                <h3 className="lp-bento__title lp-bento__title--dark">{c.services.items[3].t}</h3>
                <p className="lp-bento__desc lp-bento__desc--dark">{c.services.items[3].d}</p>
              </div>
            </article>

            {/* USA */}
            <article className="lp-bento__card lp-bento__card--sm lp-bento__card--navy">
              <span className="lp-bento__bg-label">USA</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag lp-bento__tag--gold">{c.services.items[4].tag}</span>
                <h3 className="lp-bento__title">{c.services.items[4].t}</h3>
                <p className="lp-bento__desc">{c.services.items[4].d}</p>
              </div>
            </article>

            {/* Turkey — wide bottom strip */}
            <article className="lp-bento__card lp-bento__card--wide">
              <span className="lp-bento__bg-label">TR</span>
              <div className="lp-bento__content">
                <span className="lp-bento__tag">{c.services.items[5].tag}</span>
                <h3 className="lp-bento__title lp-bento__title--dark">{c.services.items[5].t}</h3>
                <p className="lp-bento__desc lp-bento__desc--dark">{c.services.items[5].d}</p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* ── WHY US — Split layout ─────────────── */}
      <section id="why" className="lp-section" aria-labelledby="why-h2">
        <div className="lp-wrap lp-why-layout">
          <div className="lp-why-left">
            <div className="lp-section-eyebrow">{c.why.title}</div>
            <h2 id="why-h2">{c.why.title}</h2>
            <p className="lp-why-sub">{c.why.sub}</p>
            <a href="https://wa.me/2189221911999" target="_blank" rel="noopener noreferrer" className="lp-btn-navy" style={{marginTop: 24, display: "inline-flex"}}>{isRtl ? "تواصل عبر واتساب" : "Chat on WhatsApp"}</a>
          </div>
          <div className="lp-why-right">
            {c.why.items.map((w, i) => (
              <article key={w.t} className="lp-why-item">
                <div className="lp-why-item__num">{String(i + 1).padStart(2, "0")}</div>
                <div className="lp-why-item__body">
                  <div className="lp-why-item__hd">
                    <h3 className="lp-why-item__title">{w.t}</h3>
                  </div>
                  <p className="lp-why-item__desc">{w.d}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS — Timeline ───────────── */}
      <section id="how" className="lp-section" aria-labelledby="how-h2">
        <div className="lp-wrap">
          <div className="lp-section-hd">
            <div className="lp-section-eyebrow">{c.how.title}</div>
            <h2 id="how-h2">{c.how.sub}</h2>
          </div>
          <div className="lp-timeline">
            {c.how.steps.map((s, i) => (
              <Fragment key={s.n}>
                <article className="lp-timeline__item">
                  <div className="lp-timeline__side">
                    <div className="lp-timeline__num">{s.n}</div>
                  </div>
                  <div className="lp-timeline__body">
                    <h3 className="lp-timeline__title">{s.t}</h3>
                    <p className="lp-timeline__desc">{s.d}</p>
                  </div>
                </article>
                {i < c.how.steps.length - 1 && (
                  <div className="lp-timeline__connector">
                    {isRtl ? "←" : "→"}
                  </div>
                )}
              </Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────── */}
      <section className="lp-cta" aria-labelledby="cta-h2">
        <div className="lp-wrap lp-cta__inner">
          <div>
            <h2 id="cta-h2" className="lp-cta__title">{c.cta.t}</h2>
            <p className="lp-cta__sub">{c.cta.s}</p>
          </div>
          <a href="https://wa.me/2189221911999" target="_blank" rel="noopener noreferrer" className="lp-btn-white">{isRtl ? "تواصل عبر واتساب" : "Chat on WhatsApp"}</a>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────── */}
      <footer id="contact" className="lp-footer" role="contentinfo">
        <div className="lp-wrap lp-footer__grid">
          <div className="lp-footer__brand">
            <Image src="/photos/logo-without-bg.png" alt="الولاء" width={48} height={48}
              style={{ objectFit: "contain", filter: "brightness(0) invert(1) opacity(0.85)" }} />
            <p className="lp-footer__about">{c.footer.about}</p>
          </div>
          <div className="lp-footer__col">
            <h3 className="lp-footer__col-h">{c.footer.links}</h3>
            <a href="#services">{c.nav.services}</a>
            <a href="#why">{c.nav.whyUs}</a>
            <a href="#how">{c.nav.howItWorks}</a>
            <a href="#contact">{c.nav.contact}</a>
          </div>
          <div className="lp-footer__col">
            <h3 className="lp-footer__col-h">{c.footer.contact}</h3>
            <a href={`tel:${c.footer.phone}`}>📞 {c.footer.phone}</a>
            <a href={`mailto:${c.footer.email}`}>✉️ {c.footer.email}</a>
          </div>
        </div>
        <div className="lp-footer__bottom">
          <p>{c.footer.rights}</p>
        </div>
      </footer>
    </div>
  );
}

// ──────────────────────────────────────────────
// CSS
// ──────────────────────────────────────────────
const css = `
@import url('https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&family=Inter:wght@300;400;500;600;700;800&display=swap');

.lp { --navy: #0c1a35; --navy-mid: #1e3a5f; --navy-light: #234080; --gold: #f59e0b; --gold-light: #fcd34d; --white: #ffffff; --bg: #f8f9fc; --border: #e2e8f0; --text: #1e293b; --muted: #64748b; --r: 16px; --r-sm: 10px; --shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06); --shadow-md: 0 4px 24px rgba(0,0,0,0.08); --shadow-lg: 0 24px 48px rgba(0,0,0,0.12); min-height: 100vh; background: var(--white); color: var(--text); scroll-behavior: smooth; overflow-x: hidden; }
.lp * { box-sizing: border-box; margin: 0; padding: 0; }
.lp-wrap { max-width: 1200px; margin: 0 auto; padding: 0 24px; }

/* NAV */
.lp-nav { position: fixed; top: 0; inset-inline: 0; z-index: 100; padding: 16px 0; transition: all .3s; }
.lp-nav--scrolled { background: rgba(255,255,255,0.95); backdrop-filter: blur(16px); box-shadow: 0 1px 0 var(--border), 0 4px 24px rgba(0,0,0,0.06); padding: 12px 0; }
.lp-nav__row { display: flex; align-items: center; gap: 24px; }
.lp-nav__logo { display: flex; align-items: center; gap: 10px; text-decoration: none; flex-shrink: 0; }
.lp-nav__name { font-size: 20px; font-weight: 800; color: var(--navy); }
.lp-nav__links { display: flex; gap: 4px; flex: 1; justify-content: center; }
.lp-nav__links a { color: var(--muted); text-decoration: none; font-size: 14px; font-weight: 500; padding: 6px 14px; border-radius: 8px; transition: all .2s; }
.lp-nav__links a:hover { background: var(--bg); color: var(--navy); }
.lp-nav__right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
.lp-lang { background: var(--bg); border: 1px solid var(--border); color: var(--navy); border-radius: 8px; padding: 6px 14px; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .2s; font-family: inherit; }
.lp-lang:hover { background: var(--border); }
.lp-pill { padding: 8px 20px; border-radius: 8px; background: var(--gold); color: #1a0800; font-size: 14px; font-weight: 700; text-decoration: none; transition: all .2s; }
.lp-pill:hover { background: var(--gold-light); transform: translateY(-1px); }
.lp-burger { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
.lp-burger span { display: block; width: 22px; height: 2px; background: var(--navy); border-radius: 2px; transition: all .2s; }
.lp-mob { position: absolute; top: 100%; inset-inline: 0; background: var(--white); border-top: 1px solid var(--border); padding: 16px 24px; display: flex; flex-direction: column; gap: 12px; box-shadow: var(--shadow-md); }
.lp-mob a { color: var(--muted); text-decoration: none; font-size: 15px; font-weight: 500; }
.lp-mob__actions { display: flex; gap: 10px; padding-top: 4px; }

/* HERO */
.lp-hero { min-height: 100vh; background: var(--white); color: var(--text); display: flex; align-items: center; padding: 120px 0 80px; position: relative; overflow: hidden; }
.lp-hero__bg { position: absolute; inset: 0; pointer-events: none; }
.lp-hero__dot-grid { position: absolute; inset: 0; background-image: radial-gradient(rgba(12,26,53,.06) 1.5px, transparent 1.5px); background-size: 36px 36px; }
.lp-hero__blob { display: none; }
.lp-hero__layout { display: grid; grid-template-columns: 1fr 1fr; gap: 64px; align-items: center; position: relative; z-index: 2; }
.lp-hero__text { display: flex; flex-direction: column; gap: 0; }
.lp-chip { display: inline-flex; width: fit-content; padding: 6px 16px; border-radius: 100px; border: 1px solid rgba(12,26,53,.15); background: rgba(12,26,53,.05); color: var(--navy); font-size: 13px; font-weight: 600; margin-bottom: 24px; letter-spacing: .3px; }
.lp-hero__h1 { font-size: clamp(38px, 5vw, 68px); font-weight: 800; line-height: 1.1; letter-spacing: -2px; margin-bottom: 24px; }
.lp-hero__h1a { color: var(--muted); }
.lp-hero__h1b { color: var(--navy); }
.lp-hero__sub { font-size: 17px; color: var(--muted); line-height: 1.75; font-weight: 400; max-width: 480px; margin-bottom: 36px; }
.lp-hero__btns { display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 48px; }
.lp-btn-navy { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 10px; background: var(--navy); color: var(--white); font-size: 15px; font-weight: 700; text-decoration: none; transition: all .2s; border: none; cursor: pointer; font-family: inherit; }
.lp-btn-navy:hover { background: var(--navy-mid); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(12,26,53,.25); }
.lp-btn-ghost { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 10px; background: transparent; color: var(--navy); font-size: 15px; font-weight: 600; text-decoration: none; border: 1.5px solid var(--border); transition: all .2s; }
.lp-btn-ghost:hover { background: var(--bg); border-color: var(--navy); }
.lp-btn-white { display: inline-flex; align-items: center; padding: 14px 32px; border-radius: 10px; background: var(--white); color: var(--navy); font-size: 15px; font-weight: 700; text-decoration: none; transition: all .2s; border: none; cursor: pointer; font-family: inherit; flex-shrink: 0; }
.lp-btn-white:hover { background: #f1f5f9; transform: translateY(-2px); }
.lp-store-btn { display: inline-flex; align-items: center; gap: 12px; padding: 12px 22px; border-radius: 12px; background: var(--navy); color: var(--white); text-decoration: none; transition: all .2s; border: none; cursor: pointer; min-width: 160px; }
.lp-store-btn:hover { background: var(--navy-mid); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(12,26,53,.25); }
.lp-store-btn svg { flex-shrink: 0; opacity: .9; }
.lp-store-btn__small { font-size: 10px; opacity: .65; line-height: 1; margin-bottom: 2px; }
.lp-store-btn__big { font-size: 15px; font-weight: 800; line-height: 1; }

/* Stats */
.lp-stats { display: flex; gap: 32px; flex-wrap: wrap; }
.lp-stat { display: flex; flex-direction: column; gap: 4px; }
.lp-stat__n { font-size: 28px; font-weight: 800; color: var(--navy); line-height: 1; }
.lp-stat__l { font-size: 12px; color: var(--muted); letter-spacing: .5px; }

/* Right visual */
.lp-hero__visual { position: relative; height: 420px; }
.lp-hero__card { background: var(--white); border-radius: 20px; padding: 0; box-shadow: var(--shadow-lg); position: absolute; inset-inline-start: 0; top: 20px; width: 340px; overflow: hidden; }
.lp-hero__card-header { display: flex; gap: 7px; align-items: center; background: #f1f5f9; padding: 12px 16px; }
.lp-hero__card-dot { width: 11px; height: 11px; border-radius: 50%; }
.lp-hero__card-dot--r { background: #ef4444; }
.lp-hero__card-dot--y { background: #f59e0b; }
.lp-hero__card-dot--g { background: #22c55e; }
.lp-hero__card-body { padding: 20px; display: flex; flex-direction: column; gap: 14px; }
.lp-hero__card-row { display: flex; justify-content: space-between; align-items: center; }
.lp-hero__card-label { font-size: 12px; color: var(--muted); font-weight: 500; }
.lp-hero__card-val { font-size: 13px; font-weight: 600; color: var(--text); }
.lp-hero__card-val--blue { color: var(--navy-light); }
.lp-hero__card-badge { font-size: 11px; font-weight: 700; background: rgba(12,26,53,.1); color: var(--navy); padding: 3px 10px; border-radius: 100px; }
.lp-hero__progress-wrap { display: flex; align-items: center; gap: 10px; }
.lp-hero__progress-bar { flex: 1; height: 6px; border-radius: 3px; background: #e2e8f0; }
.lp-hero__progress-fill { height: 100%; border-radius: 3px; background: linear-gradient(90deg, var(--navy-mid), var(--navy-light)); }
.lp-hero__progress-label { font-size: 12px; font-weight: 700; color: var(--navy); }
.lp-hero__mini { display: flex; align-items: center; gap: 12px; background: var(--white); border-radius: 14px; padding: 14px 18px; box-shadow: var(--shadow-md); position: absolute; border: 1px solid var(--border); }
.lp-hero__mini span { font-size: 24px; }
.lp-hero__mini-t { font-size: 12px; font-weight: 700; color: var(--text); }
.lp-hero__mini-s { font-size: 11px; color: var(--muted); margin-top: 2px; }
.lp-hero__mini--1 { inset-inline-end: 0; top: 0; animation: bob 4s ease-in-out infinite; }
.lp-hero__mini--2 { inset-inline-end: 20px; bottom: 40px; animation: bob 4s ease-in-out infinite 2s; }
@keyframes bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }

/* SECTIONS */
.lp-section { padding: 96px 0; background: var(--white); }
.lp-section--alt { background: var(--bg); }
.lp-section-hd { margin-bottom: 56px; }
.lp-section-hd h2 { font-size: clamp(24px, 3.5vw, 40px); font-weight: 800; color: var(--text); letter-spacing: -1px; margin-top: 10px; max-width: 600px; line-height: 1.25; }
.lp-section-eyebrow { font-size: 12px; font-weight: 700; letter-spacing: 2px; text-transform: uppercase; color: var(--navy); display: inline-block; padding: 0 0 6px; border-bottom: 2px solid var(--gold); margin-bottom: 2px; }

/* SERVICES — Bento Grid */
.lp-bento { display: grid; grid-template-columns: 2fr 1fr 1fr; grid-template-rows: auto auto; gap: 16px; }
.lp-bento__card { border-radius: 20px; padding: 32px; position: relative; overflow: hidden; transition: transform .25s, box-shadow .25s; }
.lp-bento__card:hover { transform: translateY(-4px); box-shadow: 0 24px 48px rgba(0,0,0,0.12); }
.lp-bento__card--wide { grid-column: span 2; }
.lp-bento__card--sm {}
.lp-bento__card--navy { background: var(--navy); }
.lp-bento__card--gold { background: var(--gold); }
.lp-bento__card:not(.lp-bento__card--navy):not(.lp-bento__card--gold) { background: var(--white); border: 1.5px solid var(--border); }

/* Decorative large background text */
.lp-bento__bg-label { position: absolute; bottom: -10px; inset-inline-end: -10px; font-size: 100px; font-weight: 900; line-height: 1; opacity: .05; color: inherit; letter-spacing: -4px; pointer-events: none; user-select: none; }
.lp-bento__card--white .lp-bento__bg-label { color: var(--navy); }

/* Decorative icon */
.lp-bento__deco { position: absolute; top: 20px; inset-inline-start: 24px; font-size: 48px; opacity: .12; }

.lp-bento__content { position: relative; z-index: 2; height: 100%; display: flex; flex-direction: column; gap: 12px; }
.lp-bento__tag { display: inline-flex; width: fit-content; font-size: 10px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; padding: 4px 10px; border-radius: 100px; background: rgba(255,255,255,.15); color: rgba(255,255,255,.8); margin-bottom: 4px; }
.lp-bento__tag--gold { background: rgba(245,158,11,.25); color: var(--gold-light); }
.lp-bento__tag--light { background: rgba(12,26,53,.1); color: var(--navy); }
.lp-bento__title { font-size: clamp(22px, 2.5vw, 30px); font-weight: 800; color: var(--white); letter-spacing: -.5px; line-height: 1.1; }
.lp-bento__title--dark { color: var(--navy); }
.lp-bento__desc { font-size: 14px; color: rgba(255,255,255,.6); line-height: 1.65; max-width: 360px; }
.lp-bento__desc--dark { color: var(--muted); }

/* WHY US — Split */
.lp-why-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: start; }
.lp-why-left h2 { font-size: clamp(26px, 3.5vw, 40px); font-weight: 800; color: var(--text); letter-spacing: -1px; margin-top: 12px; line-height: 1.2; }
.lp-why-sub { font-size: 15px; color: var(--muted); line-height: 1.7; margin-top: 16px; max-width: 320px; }
.lp-why-right { display: flex; flex-direction: column; gap: 0; }
.lp-why-item { display: flex; gap: 20px; padding: 24px 0; border-bottom: 1px solid var(--border); }
.lp-why-item:first-child { padding-top: 0; }
.lp-why-item:last-child { border-bottom: none; padding-bottom: 0; }
.lp-why-item__num { font-size: 13px; font-weight: 800; color: #cbd5e1; letter-spacing: 1px; flex-shrink: 0; padding-top: 2px; min-width: 28px; }
.lp-why-item__hd { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
.lp-why-item__icon { font-size: 22px; }
.lp-why-item__title { font-size: 17px; font-weight: 800; color: var(--text); }
.lp-why-item__desc { font-size: 14px; color: var(--muted); line-height: 1.65; }

/* HOW IT WORKS — Horizontal Steps */
.lp-section-hd { display: flex; flex-direction: column; }
.lp-timeline { display: grid; grid-template-columns: 1fr auto 1fr auto 1fr; gap: 0; align-items: start; max-width: 900px; margin: 0 auto; }
.lp-timeline__item { display: flex; flex-direction: column; align-items: center; text-align: center; }
.lp-timeline__side { display: flex; flex-direction: column; align-items: center; margin-bottom: 20px; }
.lp-timeline__num { width: 56px; height: 56px; border-radius: 50%; background: var(--navy); color: var(--white); font-size: 16px; font-weight: 800; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: 0 4px 16px rgba(12,26,53,.2); }
.lp-timeline__line { display: none; }
.lp-timeline__connector { display: flex; align-items: center; justify-content: center; padding-top: 16px; color: #cbd5e1; font-size: 28px; font-weight: 300; }
.lp-timeline__body { padding: 0 16px; }
.lp-timeline__title { font-size: 18px; font-weight: 800; color: var(--text); margin-bottom: 10px; }
.lp-timeline__desc { font-size: 14px; color: var(--muted); line-height: 1.7; }

/* CTA */
.lp-cta { background: var(--navy); padding: 80px 0; }
.lp-cta__inner { display: flex; align-items: center; justify-content: space-between; gap: 32px; flex-wrap: wrap; }
.lp-cta__title { font-size: clamp(24px, 3vw, 36px); font-weight: 800; color: var(--white); margin-bottom: 8px; }
.lp-cta__sub { font-size: 16px; color: rgba(255,255,255,.55); }

/* FOOTER */
.lp-footer { background: #080f1c; color: rgba(255,255,255,.6); padding: 72px 0 0; }
.lp-footer__grid { display: grid; grid-template-columns: 2fr 1fr 1fr; gap: 48px; padding-bottom: 56px; }
.lp-footer__about { font-size: 14px; line-height: 1.7; margin-top: 14px; max-width: 260px; }
.lp-footer__col { display: flex; flex-direction: column; gap: 12px; }
.lp-footer__col-h { font-size: 14px; font-weight: 800; color: var(--white); margin-bottom: 4px; }
.lp-footer__col a { color: rgba(255,255,255,.5); font-size: 14px; text-decoration: none; line-height: 1.9; transition: color .2s; }
.lp-footer__col a:hover { color: var(--gold); }
.lp-footer__bottom { border-top: 1px solid rgba(255,255,255,.07); padding: 20px 24px; text-align: center; font-size: 13px; color: rgba(255,255,255,.25); }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .lp-hero__layout { grid-template-columns: 1fr; }
  .lp-hero__visual { display: none; }
  .lp-why-layout { grid-template-columns: 1fr; gap: 40px; }
  .lp-bento { grid-template-columns: 1fr 1fr; }
  .lp-bento__card--wide { grid-column: span 2; }
  .lp-srv-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (max-width: 768px) {
  .lp-nav__links, .lp-nav__right { display: none; }
  .lp-burger { display: flex; }
  .lp-bento { grid-template-columns: 1fr; }
  .lp-bento__card--wide { grid-column: span 1; }
  .lp-srv-grid { grid-template-columns: 1fr; }
  .lp-footer__grid { grid-template-columns: 1fr; gap: 32px; }
  .lp-cta__inner { flex-direction: column; text-align: center; }
  .lp-btn-white { width: 100%; justify-content: center; }
  .lp-stats { gap: 20px; }
  .lp-section { padding: 64px 0; }
  .lp-hero__btns { flex-wrap: wrap; }
}
@media (max-width: 480px) {
  .lp-hero__h1 { font-size: 36px; letter-spacing: -1px; }
  .lp-hero__btns { flex-direction: column; }
  .lp-btn-navy, .lp-btn-ghost { width: 100%; justify-content: center; }
}
`;
