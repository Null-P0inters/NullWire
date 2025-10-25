"use client";

import { useEffect, useRef } from "react";

import { gsap } from "@/lib/gsap";

export function Footer() {
  const footerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(".footer-fade", {
        autoAlpha: 0,
        y: 16,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.1,
        delay: 0.2,
        onComplete() {
          gsap.set(".footer-fade", { clearProps: "opacity,visibility,transform" });
        },
      });
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={footerRef}
  className="border-t border-[color:var(--border-soft)] bg-[rgba(24,24,37,0.8)] px-6 py-10 text-xs uppercase tracking-[0.3em] text-[color:var(--text-muted)]"
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <span className="footer-fade">Lorem Ipsum cuz no one gonna see this</span>
        <span className="footer-fade">that line is not a mistake</span>
      </div>
    </footer>
  );
}
