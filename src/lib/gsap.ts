import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let pluginsRegistered = false;

if (typeof window !== "undefined" && !pluginsRegistered) {
  gsap.registerPlugin(ScrollTrigger);
  pluginsRegistered = true;
}

export { gsap, ScrollTrigger };
