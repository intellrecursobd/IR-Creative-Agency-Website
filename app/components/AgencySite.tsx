"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { concepts, serviceNames, services, workFilters } from "../lib/agency";

const productionArtwork: Record<string, { format: string; lines: string[]; caption: string }> = {
  ovc: { format: "OVC", lines: ["STOP THE", "SCROLL."], caption: "ONLINE VIDEO COMMERCIALS" },
  tvc: { format: "TVC", lines: ["MAKE IT", "A MOMENT."], caption: "TELEVISION COMMERCIALS" },
  avc: { format: "AVC", lines: ["YOUR STORY.", "IN FRAME."], caption: "AVC & BRAND FILMS" },
  influencer: { format: "SOCIAL", lines: ["PEOPLE.", "CULTURE.", "CONNECTION."], caption: "INFLUENCER MARKETING & UGC" },
};

function Arrow({ diagonal = false }: { diagonal?: boolean }) {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d={diagonal ? "M6 18 18 6M6 6h12v12" : "M4 12h16m-6-6 6 6-6 6"} stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function Spark({ className = "" }: { className?: string }) {
  return <svg className={className} viewBox="0 0 100 100" fill="currentColor" aria-hidden="true"><path d="m50 0 9 30 26-15-15 26 30 9-30 9 15 26-26-15-9 30-9-30-26 15 15-26L0 50l30-9-15-26 26 15Z" /></svg>;
}

function Wordmark({ light = false }: { light?: boolean }) {
  return <a className={`wordmark${light ? " light" : ""}`} href="#home" aria-label="IntellRecurso Creative home"><span className="brand-symbol" aria-hidden="true"><i /><i /><i /></span><span>IntellRecurso<small>CREATIVE</small></span></a>;
}

function ConceptArt({ kind }: { kind: string }) {
  const artwork = productionArtwork[kind];
  if (artwork) return <div className={`concept-art production-art production-art-${kind}`} aria-hidden="true"><span className="production-format">{artwork.format}</span><div className="production-orbit"><Spark/></div><strong className="production-headline">{artwork.lines.map(line => <span key={line}>{line}</span>)}</strong><span className="production-caption">{artwork.caption}</span></div>;
  if (kind === "offscript") return <div className="concept-art offscript-art" aria-hidden="true"><img src="/offscript-campaign.webp" alt="" width="1536" height="1024" loading="lazy"/><span className="art-index">001 / BRAND WORLD</span></div>;
  if (kind === "louder") return <div className="concept-art volume-art" aria-hidden="true"><img src="/volume-campaign.webp" alt="" width="1122" height="1402" loading="lazy"/><span className="art-index">002 / CULTURE IN FULL COLOUR</span><span className="volume-type">VOLUME<br/><em>ON.</em></span></div>;
  return <div className="concept-art bloom-art" aria-hidden="true"><img src="/creative-bloom.webp" alt="" width="1536" height="1024" loading="lazy"/><span className="art-index">003 / MATERIAL EXPLORATIONS</span><span className="bloom-type">GROW<br/><em>WILD.</em></span><span className="bloom-caption">CHROME / LIGHT / POSSIBILITY</span></div>;
}

type Concept = typeof concepts[number];

export default function AgencySite() {
  const [motion, setMotion] = useState(true);
  const [heroWord, setHeroWord] = useState(0);
  const siteRef = useRef<HTMLDivElement>(null);
  const heroWords = ["ATTITUDE.", "PURPOSE.", "IMPACT."];
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("All");
  const [activeConcept, setActiveConcept] = useState<Concept | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [submitState, setSubmitState] = useState<"idle" | "sending" | "success">("idle");
  const [error, setError] = useState("");
  const [reference, setReference] = useState("");
  const dialog = useRef<HTMLDialogElement>(null);
  const requestId = useRef("");
  const menuTrigger = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setMotion(!preference.matches && localStorage.getItem("irc-motion") !== "off");
    updatePreference();
    preference.addEventListener("change", updatePreference);
    return () => preference.removeEventListener("change", updatePreference);
  }, []);
  useEffect(() => {
    if (!motion) return;
    const timer = window.setInterval(() => setHeroWord(previous => (previous + 1) % 3), 3600);
    return () => window.clearInterval(timer);
  }, [motion]);
  useEffect(() => {
    if (!motion || !("IntersectionObserver" in window)) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); } });
    }, { threshold: 0.12 });
    siteRef.current?.querySelectorAll("[data-reveal]").forEach(element => observer.observe(element));
    return () => observer.disconnect();
  }, [motion]);
  function toggleMotion() {
    setMotion(previous => { localStorage.setItem("irc-motion", previous ? "off" : "on"); return !previous; });
  }
  useEffect(() => { if (activeConcept && dialog.current && !dialog.current.open) dialog.current.showModal(); }, [activeConcept]);
  useEffect(() => { if (!menuOpen) return; const onEscape = (event: KeyboardEvent) => { if (event.key === "Escape") { setMenuOpen(false); menuTrigger.current?.focus(); } }; window.addEventListener("keydown", onEscape); return () => window.removeEventListener("keydown", onEscape); }, [menuOpen]);

  function chooseService(service: string) {
    setSelectedServices(previous => previous.includes(service) ? previous : [...previous, service]);
    dialog.current?.close(); setActiveConcept(null);
    document.querySelector("#contact")?.scrollIntoView({ behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
    document.querySelector<HTMLInputElement>('input[name="name"]')?.focus({ preventScroll: true });
  }

  async function submitBrief(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (submitState === "sending") return; setError("");
    if (!selectedServices.length) { setError("Choose at least one service so we can understand your project."); return; }
    const values = new FormData(event.currentTarget); requestId.current ||= crypto.randomUUID(); setSubmitState("sending");
    try {
      const response = await fetch("/api/enquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requestId: requestId.current, name: values.get("name"), email: values.get("email"), brand: values.get("brand"), budget: values.get("budget"), deadline: values.get("deadline"), brief: values.get("brief"), website: values.get("website"), consent: values.get("consent") === "on", services: selectedServices }) });
      const result = await response.json() as { error?: string; reference?: string }; if (!response.ok) throw new Error(result.error || "Your brief couldn’t be sent. Please try again."); setReference(result.reference || ""); setSubmitState("success");
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to connect. Please try again."); setSubmitState("idle"); }
  }

  return <div className="agency-site" data-motion={motion ? "on" : "off"} ref={siteRef}>
    <a className="skip-link" href="#main">Skip to content</a>
    <header className="site-header"><div className="nav-wrap"><Wordmark/><nav className={menuOpen ? "navigation is-open" : "navigation"} id="main-navigation" aria-label="Main navigation">{[["The work", "work"], ["The studio", "about"], ["Our expertise", "services"]].map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setMenuOpen(false)}>{label}</a>)}<a className="nav-cta" href="#contact" onClick={() => setMenuOpen(false)}>Start something <Arrow diagonal/></a></nav><button className="menu-toggle" ref={menuTrigger} aria-expanded={menuOpen} aria-controls="main-navigation" aria-label={menuOpen ? "Close menu" : "Open menu"} onClick={() => setMenuOpen(!menuOpen)}><span/><span/></button></div></header>
    <main id="main">
      <section className="hero-section" id="home" aria-labelledby="hero-title" onPointerMove={event => { if (!motion || event.pointerType !== "mouse") return; const rect = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty("--px", `${((event.clientX - rect.left) / rect.width - .5) * 18}px`); event.currentTarget.style.setProperty("--py", `${((event.clientY - rect.top) / rect.height - .5) * 12}px`); }} onPointerLeave={event => { event.currentTarget.style.setProperty("--px", "0px"); event.currentTarget.style.setProperty("--py", "0px"); }}>
        <div className="hero-meta section-wrap"><p><span className="live-dot"/> AN INDEPENDENT CREATIVE AGENCY</p><p>STRATEGY × DESIGN × DIGITAL CULTURE</p></div>
        <div className="hero-stage section-wrap"><div className="hero-media"><img src="/creative-bloom.webp" alt="A sculptural chrome flower with a vivid lime centre and orange glass details" width="1536" height="1024" fetchPriority="high"/><span className="hero-art-note">A STUDY IN CREATIVE POSSIBILITY. / IR.C</span></div><div className="hero-copy"><h1 id="hero-title"><span>IDEAS WITH</span><span className="hero-word" aria-hidden="true" key={motion ? heroWord : "still"}>{motion ? heroWords[heroWord] : "ATTITUDE."}</span><span className="sr-only">attitude.</span></h1><div className="hero-bottom"><p>Brand ideas. Films that move.<br/>Creators who connect.<br/>Made to be <strong>remembered.</strong></p><a className="hero-cta" href="#contact"><span className="round-arrow"><Arrow diagonal/></span><span>Let’s make<br/>something matter.</span></a></div></div><a className="scroll-note" href="#work"><span>SCROLL TO EXPLORE</span><svg width="16" height="24" viewBox="0 0 16 24" fill="none" aria-hidden="true"><path d="M8 1v20m-6-6 6 6 6-6" stroke="currentColor"/></svg></a><div className="hero-corner"><Spark/><span>IMAGINATION<br/>IN FULL BLOOM.</span></div></div>
        <div className="hero-controls section-wrap"><span>OVC. TVC. AVC. INFLUENCER MARKETING.</span><button onClick={toggleMotion} className="motion-toggle" aria-pressed={motion} aria-label={motion ? "Pause motion" : "Enable motion"}><span className="motion-bars" aria-hidden="true"><i/><i/><i/></span>{motion ? "MOTION ON" : "MOTION OFF"}</button></div>
      </section>
      <div className="creative-ticker" aria-label="Branding, OVC, TVC, AVC, influencer marketing, content, motion, 3D, digital and AI creative"><div className="ticker-track">{[0,1].map(copy => <div className="ticker-group" key={copy} aria-hidden={copy === 1}>{["BRANDING", "OVC", "TVC", "AVC", "INFLUENCER MARKETING", "CONTENT", "MOTION", "3D WORLDS", "DIGITAL", "AI CREATIVE"].map(word => <span key={word}>{word}<Spark/></span>)}</div>)}</div></div>
      <section className="work-section" id="work" aria-labelledby="work-title"><div className="section-wrap section-space"><div className="work-heading" data-reveal><div><p className="eyebrow">01 / THE CREATIVE PLAYGROUND</p><h2 id="work-title">THE GOOD<br/><em>STUFF.</em><span className="heading-star"><Spark/></span></h2></div><div className="work-intro"><p>Explore our studio concepts and services.<br/>Brand worlds. Film production. Creator campaigns.</p><div className="work-filters" role="group" aria-label="Filter creative work and services">{workFilters.map(filter => <button key={filter} className={activeFilter === filter ? "filter-button active" : "filter-button"} aria-pressed={activeFilter === filter} onClick={() => setActiveFilter(filter)}>{filter}</button>)}</div></div></div><div className={`project-grid${activeFilter !== "All" ? " is-filtered" : ""}`} aria-live="polite">{concepts.filter(concept => activeFilter === "All" || concept.category === activeFilter).map(concept => <button className={`project-card project-${concept.className}`} key={concept.id} onClick={() => setActiveConcept(concept)} aria-label={`Explore ${concept.title}, ${concept.type}, ${concept.label.toLowerCase()}`}><div className="project-visual"><ConceptArt kind={concept.className}/><span className="project-concept-tag">{concept.label.toUpperCase()}</span><span className="project-open" aria-hidden="true">+</span></div><div className="project-meta"><div><h3>{concept.title}</h3></div><p>{concept.type}</p></div></button>)}</div><div className="work-footnote"><span>EVERY BRAND HAS A NEXT CHAPTER.</span><a className="text-link" href="#contact">Let’s write yours <Arrow diagonal/></a></div></div></section>
      <section className="studio-section" id="about" aria-labelledby="about-title"><div className="section-wrap section-space"><div className="studio-top"><p className="eyebrow">02 / THE STUDIO</p><span>A LITTLE CURIOUS. A LOT CREATIVE.</span></div><div className="studio-grid"><h2 id="about-title" data-reveal>WE CONNECT<br/>THE <span>DOTS<Spark/>.</span></h2><div className="studio-copy" data-reveal><p className="studio-lead">Strategy meets instinct.<br/>Ideas meet real life.</p><p>We’re IntellRecurso Creative. A creative partner for brands ready to find their voice, build their world, and connect with people.</p><p>From OVCs, TVCs and AVCs to influencer partnerships, we bring design, film production, storytelling, and technology together. From the first idea to the final frame and the social feed, we’re in it with you.</p><a className="text-link" href="#services">Meet your creative toolkit <Arrow diagonal/></a></div></div><div className="studio-principles"><span><i>01</i> THINK WITH PURPOSE.</span><span><i>02</i> FEEL THE CULTURE.</span><span><i>03</i> MAKE IT TOGETHER.</span></div></div></section>
      <section className="services-section" id="services" aria-labelledby="services-title"><div className="section-wrap section-space"><div className="services-heading" data-reveal><div><p className="eyebrow">03 / CREATIVE FIREPOWER</p><h2 id="services-title">ALL THE<br/><em>RIGHT MOVES.</em></h2></div><p>Branding. Films. Creator connections.<br/>One creative partner, from idea to delivery.</p></div><div className="service-list">{services.map((service,index) => <details className="service-item" key={service.title} open={index === 0 ? true : undefined}><summary><span className="service-number">{String(index + 1).padStart(2, "0")}</span><span className="service-summary"><strong>{service.title}</strong><span>{service.short}</span></span><span className="service-plus" aria-hidden="true">+</span></summary><div className="service-body"><p>{service.description}</p><ul>{service.deliverables.map(item => <li key={item}>{item}</li>)}</ul><button className="text-link" onClick={() => chooseService(service.title)}>Build something with us <Arrow diagonal/></button></div></details>)}</div></div></section>
      <section className="process-section"><div className="section-wrap section-space"><div className="process-heading"><p className="eyebrow">04 / FROM SPARK TO SPOTLIGHT</p><h2>A LITTLE CHEMISTRY.<br/><em>A CLEAR PROCESS.</em></h2></div><div className="process-grid">{[{ title: "GET CURIOUS.", text: "Your brand. Your audience. The thing you want to change. We start by listening." },{ title: "FIND THE ANGLE.", text: "We turn the conversation into a strategy and a creative direction with a clear scope." },{ title: "MAKE THE MAGIC.", text: "We design, create, and refine together. Your feedback helps shape the final work." },{ title: "SEND IT OUT.", text: "Final assets, ready for the world. Then we look at what’s next for your brand." }].map((step,index) => <div className="process-step" key={step.title}><span className="step-number">0{index+1}<Arrow diagonal/></span><h3>{step.title}</h3><p>{step.text}</p></div>)}</div></div></section>
      <section className="contact-section" id="contact" aria-labelledby="contact-title"><div className="contact-grid section-wrap section-space"><div className="contact-copy"><p className="eyebrow">05 / LET’S MAKE SOMETHING MATTER</p><h2 id="contact-title" data-reveal>YOUR NEXT<br/>BIG THING<br/><em>STARTS HERE.</em></h2><p>A fresh brand. Your next film.<br/>A creator campaign with a point of view.<br/>We’d love to hear it.</p><Spark className="contact-spark"/><p className="contact-small">BRING THE SPARK. WE’LL BRING THE ENERGY.</p></div><div className="brief-panel">{submitState === "success" ? <div className="success-message" role="status"><Spark/><p className="eyebrow">THE SPARK IS OFFICIAL.</p><h3>Brief received.<br/>Good things start here.</h3><p>Thanks for introducing your project to IntellRecurso Creative. Your enquiry has been saved for our team to review.</p>{reference && <p className="submission-reference">Your reference: <strong>{reference}</strong></p>}<button className="button button-dark" onClick={() => { setSubmitState("idle"); requestId.current = ""; setSelectedServices([]); }}>Start another brief <Arrow diagonal/></button></div> : <form onSubmit={submitBrief}><h3>Tell us what’s on your mind.</h3><p className="form-intro">A few details to get the conversation started. <span>* Required</span></p><div className="form-row"><label>Your name *<input name="name" autoComplete="name" required minLength={2} maxLength={100} placeholder="The name behind the idea"/></label><label>Email address *<input type="email" name="email" autoComplete="email" required maxLength={200} placeholder="you@yourbrand.com"/></label></div><label>Brand / company<input name="brand" autoComplete="organization" maxLength={160} placeholder="Who are we creating for?"/></label><fieldset><legend>What can we help with? *</legend><div className="service-choices">{serviceNames.map(name => <label key={name} className={selectedServices.includes(name) ? "service-choice selected" : "service-choice"}><input type="checkbox" value={name} checked={selectedServices.includes(name)} onChange={() => setSelectedServices(previous => previous.includes(name) ? previous.filter(value => value !== name) : [...previous, name])}/><span>{name}</span><span aria-hidden="true">{selectedServices.includes(name) ? "✓" : "+"}</span></label>)}</div></fieldset><div className="form-row"><label>Budget range<input name="budget" maxLength={100} placeholder="Estimate + currency (optional)"/></label><label>Ideal launch date<input name="deadline" type="date"/></label></div><label>A little about your project *<textarea name="brief" rows={4} minLength={20} maxLength={4000} required placeholder="What’s the idea, the goal, or the challenge? (20+ characters)"/></label><div className="honeypot" aria-hidden="true"><label>Leave this field empty<input name="website" tabIndex={-1} autoComplete="off"/></label></div><label className="consent"><input name="consent" type="checkbox" required/><span>I agree to share these details with IntellRecurso Creative so the team can respond about my project.</span></label>{error && <p className="form-error" role="alert">{error}</p>}<button type="submit" className="button button-dark submit-button" disabled={submitState === "sending"}>{submitState === "sending" ? "Sending your spark…" : "Send the brief"}<Arrow diagonal/></button><p className="form-note">Your project details are visible only to our team.</p></form>}</div></div></section>
    </main>
    <footer className="site-footer"><div className="section-wrap"><div className="footer-top"><span>GOOD PEOPLE. GREAT POSSIBILITIES.</span><a className="back-top" href="#home">BACK TO TOP <Arrow diagonal/></a></div><a className="footer-wordmark" href="#home" aria-label="IntellRecurso Creative home">IntellRecurso<span>CREATIVE STUDIO</span></a><div className="footer-bottom"><span>© {new Date().getUTCFullYear()} IntellRecurso Creative.</span><div><a href="#work">The work</a><a href="#contact">Start a project</a><a href="/inbox">Studio login <Arrow diagonal/></a></div><span>IDEAS INTO IMPACT. <Spark/></span></div></div></footer>
    <dialog ref={dialog} className="concept-dialog" aria-labelledby="concept-dialog-title" onClose={() => setActiveConcept(null)} onClick={event => { if (event.target === event.currentTarget) dialog.current?.close(); }}>{activeConcept && <div className="dialog-inner"><button className="dialog-close" onClick={() => dialog.current?.close()} aria-label="Close concept">×</button><ConceptArt kind={activeConcept.className}/><div className="dialog-copy"><p className="eyebrow">{activeConcept.label.toUpperCase()} / {activeConcept.type.toUpperCase()}</p><h2 id="concept-dialog-title">{activeConcept.title}</h2><p className="dialog-tagline">{activeConcept.tagline}</p><p>{activeConcept.description}</p><ul>{activeConcept.deliverables.map(item => <li key={item}>{item}</li>)}</ul><button className="button button-purple" onClick={() => chooseService(activeConcept.service)}>{activeConcept.label === "Service spotlight" ? "Brief this service" : "Create something for my brand"}</button></div></div>}</dialog>
  </div>;
}
