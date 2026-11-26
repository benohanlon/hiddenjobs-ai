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
