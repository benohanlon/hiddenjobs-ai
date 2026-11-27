const workshop = document.querySelector(".workshop");
const requestedView = new URLSearchParams(window.location.search).get("view");

if (requestedView === "overhead") {
  workshop.dataset.view = "overhead";
  delete workshop.dataset.render;
} else if (requestedView === "tag") {
  delete workshop.dataset.view;
  delete workshop.dataset.render;
}

if (workshop.dataset.render === "geometry" && "IntersectionObserver" in window) {
  const exampleLink = workshop.querySelector(".box-example");
  const reveal = new IntersectionObserver(([entry], observer) => {
    if (entry.intersectionRatio >= 0.4) {
      workshop.dataset.reveal = "";
      observer.disconnect();
    }
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.4 });
  reveal.observe(exampleLink);
}

if (workshop.dataset.render === "geometry") {
  const example = workshop.querySelector(".box-example");
  const scene = workshop.querySelector(".box-scene");
  const mobileLayout = window.matchMedia("(max-width: 60rem)");
  const motion = window.matchMedia("(prefers-reduced-motion: no-preference)");
  let pendingFrame = 0;

  function moveWorkbench() {
    pendingFrame = 0;
    const frame = mobileLayout.matches ? scene.getBoundingClientRect() : null;
    const viewport = window.innerHeight;
    const distance = frame ? viewport - frame.top : window.scrollY;
    const travel = frame ? viewport : Math.min(viewport, 360);
    const amplitude = frame ? Math.min(36, frame.height * 0.075) : 18;
    const progress = Math.min(1, Math.max(0, distance / travel));
    const eased = progress * progress * (3 - 2 * progress);
    const zoom = 1 + (frame ? 0.055 : 0.03) * eased;
    example.style.setProperty("--workbench-drift", `${(amplitude * eased).toFixed(2)}px`);
    example.style.setProperty("--workbench-zoom", zoom.toFixed(4));
  }

  function queueWorkbenchFrame() {
    if (!pendingFrame) pendingFrame = window.requestAnimationFrame(moveWorkbench);
  }

  function syncWorkbenchMotion() {
    if (motion.matches) {
      window.addEventListener("scroll", queueWorkbenchFrame, { passive: true });
      window.addEventListener("resize", queueWorkbenchFrame);
      queueWorkbenchFrame();
    } else {
      window.removeEventListener("scroll", queueWorkbenchFrame);
      window.removeEventListener("resize", queueWorkbenchFrame);
      window.cancelAnimationFrame(pendingFrame);
      pendingFrame = 0;
      example.style.removeProperty("--workbench-drift");
      example.style.removeProperty("--workbench-zoom");
    }
  }

  motion.addEventListener("change", syncWorkbenchMotion);
  syncWorkbenchMotion();
}

const copyButton = document.querySelector("#copy-prompt");
const prompt = document.querySelector("#build-prompt");
const status = document.querySelector("#copy-status");

copyButton.hidden = false;
copyButton.addEventListener("click", () => copyBuildPrompt("Copied. Paste it into your AI with your CV and work samples."));

for (const opener of document.querySelectorAll("[data-prefill]")) {
  const destination = new URL(opener.href);
  destination.searchParams.set("q", prompt.textContent.trim());
  opener.href = destination.href;
}

document.querySelector("#open-gemini").addEventListener("click", () => {
  copyBuildPrompt("Copied. Paste it into Gemini with your CV and work samples.");
});

async function copyBuildPrompt(message) {
  try {
    await navigator.clipboard.writeText(prompt.textContent.trim());
    status.textContent = message;
  } catch {
    const selection = window.getSelection();
    const range = document.createRange();
    range.selectNodeContents(prompt);
    selection.removeAllRanges();
    selection.addRange(range);
    status.textContent = "Prompt selected. Copy it with your keyboard or device menu.";
  }
}
