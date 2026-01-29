
document.addEventListener("DOMContentLoaded", () => {
  const loader = document.getElementById("loader");
  if (loader) {
    setTimeout(() => loader.classList.add("hidden"), 800);
  }

  // Initialize EmailJS
  (function() {
    emailjs.init("Z6lDo9ObQinqBwv_z"); // Replace with your EmailJS public key
  })();

  const themeToggle = document.getElementById("themeToggle");
  const html = document.documentElement;
  
  // Check for saved theme preference or default to light
  const savedTheme = localStorage.getItem("theme") || "light";
  html.setAttribute("data-theme", savedTheme);
  themeToggle.innerHTML =
    savedTheme === "dark"
      ? '<i class="fas fa-sun"></i>'
      : '<i class="fas fa-moon"></i>';

  if (themeToggle) {
    themeToggle.addEventListener("click", () => {
      const currentTheme = html.getAttribute("data-theme");
      const newTheme = currentTheme === "dark" ? "light" : "dark";
      
      html.setAttribute("data-theme", newTheme);
      localStorage.setItem("theme", newTheme);
      
      themeToggle.innerHTML =
        newTheme === "dark"
          ? '<i class="fas fa-sun"></i>'
          : '<i class="fas fa-moon"></i>';
    });
  }

  const navLinks = document.querySelectorAll(".nav-link");
  const sections = document.querySelectorAll(".section");

  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute("href"));
      if (!target) return;

      navLinks.forEach(l => l.classList.remove("active"));
      sections.forEach(s => s.classList.remove("active"));

      link.classList.add("active");
      target.classList.add("active");

      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });

  const modal = document.getElementById("modal");
  const modalTitle = document.getElementById("modalTitle");
  const modalTech = document.getElementById("modalTech");
  const modalImage = document.getElementById("modalImage");
  const modalGithub = document.getElementById("modalGithub");
  const modalClose = document.querySelector(".modal-close");

  document.querySelectorAll(".portfolio-item").forEach(item => {
    item.style.cursor = "pointer";

    item.addEventListener("click", () => {
      modalTitle.textContent = item.dataset.title || "";
      modalTech.textContent = item.dataset.tech || "";
      modalImage.src = item.dataset.image || "";

      if (modalGithub) {
        modalGithub.href = item.dataset.github || "#";
        modalGithub.style.display = item.dataset.github
          ? "inline-block"
          : "none";
      }

      modal.classList.add("active");
    });

    item.addEventListener("dblclick", () => {
      const repo = item.dataset.github;
      if (repo) window.open(repo, "_blank");
    });
  });

  if (modalClose) {
    modalClose.addEventListener("click", () => {
      modal.classList.remove("active");
    });
  }

  if (modal) {
    modal.addEventListener("click", e => {
      if (e.target === modal) modal.classList.remove("active");
    });
  }

  // Mobile menu toggle
  const menuToggle = document.getElementById("menuToggle");
  const sidebar = document.getElementById("sidebar");
  
  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("active");
    });
  }

  // Scroll to top button
  const scrollTop = document.getElementById("scrollTop");
  
  window.addEventListener("scroll", () => {
    if (scrollTop) {
      if (window.pageYOffset > 300) {
        scrollTop.classList.add("visible");
      } else {
        scrollTop.classList.remove("visible");
      }
    }
  });
  
  if (scrollTop) {
    scrollTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }

  // Contact form submission with EmailJS
  const contactForm = document.getElementById("contactForm");
  const notification = document.getElementById("notification");
  
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      
      // Get form values
      const formData = new FormData(contactForm);
      const formValues = Object.fromEntries(formData);
      
      // Show loading state
      const submitBtn = contactForm.querySelector('.submit-btn');
      const originalBtnContent = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
      submitBtn.disabled = true;
      
      // Send email using EmailJS
      emailjs.send("service_vm3xitm","template_a58fy07", formValues)
        .then(function(response) {
          console.log('SUCCESS!', response.status, response.text);
          
          // Show success notification
          if (notification) {
            notification.classList.add("show");
            setTimeout(() => {
              notification.classList.remove("show");
            }, 3000);
          }
          
          // Reset form
          contactForm.reset();
          
          // Reset button
          submitBtn.innerHTML = originalBtnContent;
          submitBtn.disabled = false;
        }, function(error) {
          console.log('FAILED...', error);
          
          // Show error notification
          if (notification) {
            notification.querySelector('i').className = 'fas fa-exclamation-circle';
            notification.querySelector('h4').textContent = 'Error!';
            notification.querySelector('p').textContent = 'Failed to send message. Please try again.';
            notification.classList.add("show");
            setTimeout(() => {
              notification.classList.remove("show");
              // Reset notification content
              notification.querySelector('i').className = 'fas fa-check-circle';
              notification.querySelector('h4').textContent = 'Success!';
              notification.querySelector('p').textContent = 'Your message has been sent.';
            }, 3000);
          }
          
          // Reset button
          submitBtn.innerHTML = originalBtnContent;
          submitBtn.disabled = false;
        });
    });
  }
});