import { gsap } from "gsap";

document.addEventListener("DOMContentLoaded", () => {
  gsap.from(".fade-up", {
    y: 50,
    opacity: 0,
    duration: 0.8,
    ease: "power2.out",
  });
});
