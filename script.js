
document.addEventListener("DOMContentLoaded", () => {
    const loader = document.getElementById("loader");
    setTimeout(() => {
    loader.classList.add("hidden");
    }, 800);

    const themeToggle = document.getElementById("themeToggle");
    const html = document.documentElement;
    const currentTheme = localStorage.getItem("theme") || "light";
    
    html.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);

    themeToggle.addEventListener("click", () => {
    const theme = html.getAttribute("data-theme");
    const newTheme = theme === "light" ? "dark" : "light";
    
    html.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    updateThemeIcon(newTheme);
    });

    function updateThemeIcon(theme) {
    const icon = themeToggle.querySelector("i");
    icon.className = theme === "light" ? "fas fa-moon" : "fas fa-sun";
    }

    const menuToggle = document.getElementById("menuToggle");
    const sidebar = document.getElementById("sidebar");

    menuToggle.addEventListener("click", () => {
    sidebar.classList.toggle("active");
    const icon = menuToggle.querySelector("i");
    icon.classList.toggle("fa-bars");
    icon.classList.toggle("fa-times");
    });

    const navLinks = document.querySelectorAll(".nav-link");
    const sections = document.querySelectorAll(".section");

    navLinks.forEach(link => {
    link.addEventListener("click", e => {
        e.preventDefault();
        const targetId = link.getAttribute("href").replace("#", "");
        const targetSection = document.getElementById(targetId);

        if (!targetSection) return;

        navLinks.forEach(l => l.classList.remove("active"));
        sections.forEach(s => s.classList.remove("active"));

        link.classList.add("active");
        targetSection.classList.add("active");

        if (window.innerWidth <= 768) {
        sidebar.classList.remove("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.add("fa-bars");
        icon.classList.remove("fa-times");
        }

        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    });

    const scrollTopBtn = document.getElementById("scrollTop");

    window.addEventListener("scroll", () => {
    scrollTopBtn.classList.toggle("visible", window.scrollY > 300);
    });

    scrollTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    });

    const contactForm = document.getElementById("contactForm");
    const notification = document.getElementById("notification");

    contactForm.addEventListener("submit", e => {
    e.preventDefault();
    
    notification.classList.add("show");
    setTimeout(() => {
        notification.classList.remove("show");
    }, 3000);
    
    contactForm.reset();
    });

    const portfolioItems = document.querySelectorAll(".portfolio-item");
    const modal = document.getElementById("modal");
    const modalClose = document.querySelector(".modal-close");
    const modalTitle = document.getElementById("modalTitle");
    const modalTech = document.getElementById("modalTech");
    const modalImage = document.getElementById("modalImage");

    portfolioItems.forEach(item => {
    item.addEventListener("click", () => {
        const title = item.getAttribute("data-title");
        const tech = item.getAttribute("data-tech");
        const image = item.getAttribute("data-image");

        modalTitle.textContent = title;
        modalTech.textContent = tech;
        modalImage.src = image;
        
        modal.classList.add("active");
    });
    });

    modalClose.addEventListener("click", () => {
    modal.classList.remove("active");
    });

    modal.addEventListener("click", e => {
    if (e.target === modal) {
        modal.classList.remove("active");
    }
    });

    document.querySelectorAll(".stat-card").forEach(card => {
    card.addEventListener("click", () => {
        card.style.transform = "scale(0.95)";
        setTimeout(() => {
        card.style.transform = "";
        }, 200);
    });
    });
});
