const body = document.body;
const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const navLinks = [...document.querySelectorAll(".nav-link")];
const sections = [...document.querySelectorAll("main section[id]")];

menuToggle?.addEventListener("click", () => {
  const open = mainNav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(open));
  body.classList.toggle("menu-open", open);
});

navLinks.forEach(link => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  });
});

// Highlight the section currently in view.
const sectionObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinks.forEach(link => link.classList.toggle(
      "active",
      link.getAttribute("href") === `#${entry.target.id}`
    ));
  });
}, { rootMargin: "-35% 0px -55% 0px", threshold: 0 }) : null;

sections.forEach(section => sectionObserver?.observe(section));

// Reveal-on-scroll animation.
const revealObserver = "IntersectionObserver" in window ? new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 }) : null;

document.querySelectorAll(".reveal").forEach(el => { if (revealObserver) revealObserver.observe(el); else el.classList.add("visible"); });

// Testimonial slider.
const testimonials = [...document.querySelectorAll(".testimonial")];
let testimonialIndex = 0;

function showTestimonial(index) {
  testimonialIndex = (index + testimonials.length) % testimonials.length;
  testimonials.forEach((item, i) => item.classList.toggle("active", i === testimonialIndex));
}

document.querySelector(".next")?.addEventListener("click", () => showTestimonial(testimonialIndex + 1));
document.querySelector(".prev")?.addEventListener("click", () => showTestimonial(testimonialIndex - 1));

if (testimonials.length > 1) setInterval(() => showTestimonial(testimonialIndex + 1), 7000);


/* Contact form email submission */

const contactForm = document.querySelector("#contactForm");
const formStatus = contactForm?.querySelector(".form-status");
const submitButton = contactForm?.querySelector(
  'button[type="submit"]'
);

contactForm?.addEventListener("submit", async event => {
  event.preventDefault();

  if (!contactForm.checkValidity()) {
    contactForm.reportValidity();
    return;
  }

  const originalButtonText = submitButton.innerHTML;
  const data = new FormData(contactForm);
  const name = String(data.get("name") || "").trim();

  submitButton.disabled = true;
  submitButton.textContent = "Sending...";
  formStatus.textContent = "";

  try {
    const response = await fetch(contactForm.action, {
      method: "POST",
      body: data,
      headers: {
        Accept: "application/json"
      }
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(
        result.errors?.map(error => error.message).join(", ") ||
        "Your message could not be sent."
      );
    }

    formStatus.textContent =
      `Thank you${name ? `, ${name}` : ""}! ` +
      "Your message has been sent successfully.";

    formStatus.style.color = "green";

    contactForm.reset();

  } catch (error) {
    console.error("Contact form error:", error);

    formStatus.textContent =
      "Sorry, your message could not be sent. " +
      "Please try again or email me directly.";

    formStatus.style.color = "red";

  } finally {
    submitButton.disabled = false;
    submitButton.innerHTML = originalButtonText;
  }
});

// Automatic footer year.
const year = document.querySelector("#year");
if (year) year.textContent = new Date().getFullYear();

// Close mobile menu when Escape is pressed.
document.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    mainNav.classList.remove("open");
    menuToggle?.setAttribute("aria-expanded", "false");
    body.classList.remove("menu-open");
  }
});
// Reliable back-to-top behavior.
document.querySelector(".back-top")?.addEventListener("click", event => { event.preventDefault(); window.scrollTo({ top: 0, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" }); });


// Project details modal and category filtering (works on home and projects page).
const projectModal = document.querySelector("#projectModal");
const modalTitle = projectModal?.querySelector("[data-modal-title]");
const modalDescription = projectModal?.querySelector("[data-modal-description]");
const modalTags = projectModal?.querySelector("[data-modal-tags]");
const modalLive = projectModal?.querySelector("[data-modal-live]");
const modalSource = projectModal?.querySelector("[data-modal-source]");
function openProject(card) {
  if (!projectModal || !card) return;
  const title = card.dataset.title || card.querySelector("h2,h3")?.textContent || "Project";
  const description = card.dataset.description || card.querySelector("p")?.textContent || "Project details.";
  const tags = (card.dataset.tags || [...card.querySelectorAll(".tags span")].map(x => x.textContent).join(",")).split(",").map(x=>x.trim()).filter(Boolean);
  modalTitle.textContent = title; modalDescription.textContent = description;
  modalTags.replaceChildren(...tags.map(tag => { const el=document.createElement("span"); el.textContent=tag; return el; }));
  [[modalLive,card.dataset.liveUrl],[modalSource,card.dataset.sourceUrl]].forEach(([link,url])=>{ if(!link)return; if(url && /^https?:\/\//i.test(url)){link.href=url;link.hidden=false;}else{link.hidden=true;link.removeAttribute("href");} });
  projectModal.showModal();
}
document.querySelectorAll("[data-project-trigger]").forEach(trigger=>trigger.addEventListener("click",event=>{event.preventDefault();openProject(trigger.closest("[data-project]") || document.querySelector(`[data-project="${trigger.dataset.projectTrigger}"]`));}));
projectModal?.querySelector("[data-modal-close]")?.addEventListener("click",()=>projectModal.close());
projectModal?.addEventListener("click",event=>{if(event.target===projectModal)projectModal.close();});

document.querySelectorAll("[data-filter]").forEach(button=>button.addEventListener("click",()=>{
  const filter=button.dataset.filter;
  document.querySelectorAll("[data-filter]").forEach(b=>{b.classList.toggle("active",b===button);b.setAttribute("aria-pressed",String(b===button));});
  document.querySelectorAll("[data-project]").forEach(card=>{card.hidden=filter!=="all" && !(card.dataset.category||"").split(/\s+/).includes(filter);});
}));
