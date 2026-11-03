import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { profile } from "./data";

gsap.registerPlugin(ScrollTrigger);

/* Micro-interaction: button gently follows the pointer */
function Magnetic({ href, children, solid }: { href: string; children: ReactNode; solid?: boolean }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: React.PointerEvent) => {
    const r = ref.current!.getBoundingClientRect();
    gsap.to(ref.current, { x: (e.clientX - r.left - r.width / 2) * 0.25, y: (e.clientY - r.top - r.height / 2) * 0.25, duration: 0.3 });
  };
  const leave = () => gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: "elastic.out(1,0.4)" });
  return (
    <a ref={ref} href={href} onPointerMove={move} onPointerLeave={leave}
      target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer"
      className={`inline-block rounded-full px-7 py-3 font-bold transition-colors ${solid ? "bg-lav text-ink hover:bg-rose" : "border border-lav/50 text-cream hover:border-rose hover:text-rose"}`}>
      {children}
    </a>
  );
}

export default function App() {
  const hero = useRef<HTMLElement>(null);
  const tilt = useRef<HTMLDivElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const bio = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      /* One orchestrated load: name letters rise, 3D stage settles */
      gsap.from(".char", { yPercent: 110, opacity: 0, stagger: 0.04, duration: 1, ease: "power4.out" });
      gsap.from(stage.current, { scale: 0.7, opacity: 0, rotateY: -50, duration: 1.4, ease: "expo.out", delay: 0.2 });

      /* Scroll-driven 360° rotation with layers separating in depth */
      const tl = gsap.timeline({ scrollTrigger: { trigger: hero.current, start: "top top", end: "+=160%", scrub: 1, pin: true } });
      tl.to(stage.current, { rotateY: 360, ease: "none" }, 0)
        .to(".layer-frame", { z: 110, ease: "none" }, 0)
        .to(".layer-glow", { z: -140, scale: 1.15, ease: "none" }, 0)
        .to(".layer-chip", { z: 180, ease: "none" }, 0)
        .to(".hero-copy", { yPercent: -25, opacity: 0.35, ease: "none" }, 0);

      /* Scroll storytelling: bio words light up as you read */
      gsap.fromTo(".word", { opacity: 0.18 }, { opacity: 1, stagger: 0.1, ease: "none",
        scrollTrigger: { trigger: bio.current, start: "top 80%", end: "bottom 45%", scrub: true } });

      /* Depth: timeline rows slide in with perspective */
      gsap.utils.toArray<HTMLElement>(".edu-row").forEach((el) =>
        gsap.from(el, { rotateX: -40, y: 40, opacity: 0, transformOrigin: "top", duration: 0.9, ease: "power3.out",
          scrollTrigger: { trigger: el, start: "top 88%" } }));
    });

    /* Mouse tilt for the hero stage (depth & perspective) */
    const onMove = (e: PointerEvent) => {
      const x = e.clientX / window.innerWidth - 0.5, y = e.clientY / window.innerHeight - 0.5;
      gsap.to(tilt.current, { rotateY: x * 18, rotateX: -y * 18, duration: 0.6 });
    };
    window.addEventListener("pointermove", onMove);
    return () => { window.removeEventListener("pointermove", onMove); mm.revert(); ScrollTrigger.getAll().forEach((t) => t.kill()); };
  }, []);

  const letters = (s: string) => s.split("").map((c, i) => (
    <span key={i} className="inline-block overflow-hidden align-bottom"><span className="char inline-block">{c === " " ? "\u00A0" : c}</span></span>));

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-6 py-5 mix-blend-difference md:px-12">
        <a href="#top" className="font-display text-lg">Hithyshi PM</a>
        <nav className="flex gap-6 text-sm">
          {["About", "Skills", "Education", "Projects", "Contact"].map((n) => (
            <a key={n} href={`#${n.toLowerCase()}`} className="hidden hover:text-rose md:inline">{n}</a>))}
          <a href="#contact" className="md:hidden">Contact</a>
        </nav>
      </header>

      {/* HERO */}
      <section id="top" ref={hero} className="relative flex h-screen items-center overflow-hidden px-6 md:px-12"
        style={{ background: "radial-gradient(60% 70% at 70% 50%, #3a2858 0%, #15101d 70%)" }}>
        <div className="hero-copy relative z-10 max-w-xl">
          <p className="mb-4 text-lav">{profile.role}</p>
          <h1 className="font-display text-6xl font-semibold leading-[0.95] md:text-8xl">
            <span className="block">{letters("Hithyshi")}</span><span className="block text-lav">{letters("PM")}</span>
          </h1>
          <p className="mt-6 max-w-md text-lg text-cream/80">{profile.tagline}</p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Magnetic href="#contact" solid>Email me</Magnetic>
            <Magnetic href={profile.github}>View GitHub</Magnetic>
          </div>
        </div>

        <div className="absolute right-[4%] top-1/2 -translate-y-1/2 md:right-[8%]" style={{ perspective: 1200 }}>
          <div ref={tilt} className="preserve"><div ref={stage} className="preserve relative h-[340px] w-[270px] md:h-[470px] md:w-[370px]">
            <div className="layer-glow hide-back absolute -inset-8 rounded-[48px] border border-lav/30" style={{ transform: "translateZ(-80px)", boxShadow: "0 0 90px #8a5fc2 inset" }} />
            <img src="/hithyshi.jpg" alt="Portrait of Hithyshi PM" className="hide-back absolute inset-0 h-full w-full rounded-[32px] object-cover" />
            <div className="layer-frame hide-back absolute inset-0 translate-x-4 translate-y-4 rounded-[32px] border-2 border-rose/70" style={{ transform: "translateZ(60px) translate(16px,16px)" }} />
            <span className="layer-chip hide-back absolute -left-8 top-12 rounded-full bg-ink/80 px-4 py-2 text-sm backdrop-blur" style={{ transform: "translateZ(100px)" }}>Bharatanatyam</span>
            <span className="layer-chip hide-back absolute -right-6 bottom-16 rounded-full bg-ink/80 px-4 py-2 text-sm backdrop-blur" style={{ transform: "translateZ(100px)" }}>B.E. AIML</span>
            {/* back of the 360° turn */}
            <div className="absolute inset-0 flex items-center justify-center rounded-[32px] border border-lav/40 bg-plum font-display text-7xl text-lav hide-back" style={{ transform: "rotateY(180deg)" }}>HPM</div>
          </div></div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="mx-auto max-w-4xl px-6 py-32">
        <h2 className="mb-10 font-display text-4xl md:text-5xl">About me</h2>
        <p ref={bio} className="font-display text-2xl leading-relaxed md:text-4xl md:leading-snug">
          {profile.bio.split(" ").map((w, i) => <span key={i} className="word inline-block pr-[0.28em]">{w}</span>)}
        </p>
        <ul className="mt-12 flex flex-wrap gap-3">
          {profile.interests.map((i) => <li key={i} className="rounded-full border border-lav/30 px-5 py-2 transition-transform hover:-translate-y-1 hover:border-rose">{i}</li>)}
        </ul>
      </section>

      {/* SKILLS */}
      <section id="skills" className="bg-plum px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-12 font-display text-4xl md:text-5xl">Skills</h2>
          <div className="divide-y divide-lav/20">
            {profile.skills.map((s) => (
              <div key={s.name} className="group flex items-baseline justify-between gap-6 py-6 transition-colors hover:text-rose">
                <span className="font-display text-2xl md:text-3xl">{s.name}</span>
                <span className="text-cream/70 group-hover:text-rose">{s.level}</span>
              </div>))}
          </div>
        </div>
      </section>

      {/* EDUCATION */}
      <section id="education" className="mx-auto max-w-4xl px-6 py-32" style={{ perspective: 1000 }}>
        <h2 className="mb-12 font-display text-4xl md:text-5xl">Education</h2>
        <ol className="space-y-6 border-l border-lav/30 pl-8">
          {profile.education.map((e) => (
            <li key={e.place} className="edu-row relative rounded-2xl bg-plum/70 p-6">
              <span className="absolute -left-[41px] top-8 h-4 w-4 rounded-full bg-lav" />
              <p className="text-sm text-lav">{e.when}</p>
              <h3 className="font-display text-2xl">{e.place}</h3>
              <p className="text-cream/75">{e.detail}</p>
            </li>))}
        </ol>
      </section>

      {/* PROJECTS */}
      <section id="projects" className="bg-plum px-6 py-28">
        <div className="mx-auto max-w-4xl">
          <h2 className="mb-8 font-display text-4xl md:text-5xl">Projects</h2>
          <p className="max-w-xl text-xl text-cream/80">No projects yet. I'm in my first semester, and my first builds will be added here as I make them. Follow along on GitHub.</p>
          <div className="mt-8"><Magnetic href={profile.github}>Open my GitHub</Magnetic></div>
        </div>
      </section>

      {/* CONTACT */}
      <section id="contact" className="mx-auto max-w-4xl px-6 py-32 text-center">
        <h2 className="font-display text-5xl md:text-7xl">Let's talk</h2>
        <p className="mx-auto mt-6 max-w-md text-cream/80">Say hello about dance, design, code or anything creative.</p>
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <Magnetic href={`mailto:${profile.email}`} solid>Email {profile.email}</Magnetic>
          <Magnetic href={`tel:${profile.phone}`}>Call {profile.phone}</Magnetic>
          <Magnetic href={profile.github}>GitHub</Magnetic>
        </div>
        <footer className="mt-24 text-sm text-cream/50">© 2026 Hithyshi PM</footer>
      </section>
    </>
  );
}
