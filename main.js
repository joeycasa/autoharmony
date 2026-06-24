/* =============================================
   Autoharmony — main.js
   ============================================= */

/* =============================================
   CANVAS PARTICLE BACKGROUND
   ============================================= */
(function initCanvas() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let W, H, particles, connections, animId;
  const PARTICLE_COUNT = 80;
  const MAX_DIST = 140;
  const PRIMARY_COLOR = '79,106,240';

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function createParticles() {
    particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:  Math.random() * W,
      y:  Math.random() * H,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r:  Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2
    }));
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);

    // Move particles
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    }

    // Draw connections
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < MAX_DIST) {
          const alpha = (1 - dist / MAX_DIST) * 0.18;
          ctx.strokeStyle = `rgba(${PRIMARY_COLOR},${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    for (const p of particles) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${PRIMARY_COLOR},${p.alpha})`;
      ctx.fill();
    }

    animId = requestAnimationFrame(tick);
  }

  resize();
  createParticles();
  tick();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  }, { passive: true });
})();


/* =============================================
   CHAT DEMO — fully self-contained, no globals
   ============================================= */
(function initChat() {

  // Conversation script — straight ASCII quotes only, no smart quotes
  const SCRIPT = [
    {
      side: 'customer',
      text: 'Hi there — I saw a 2024 F-150 XLT on your site. What is the best price you can do?'
    },
    {
      side: 'ai',
      text: 'Great choice on the F-150! To put together an accurate number, quick question: do you have a trade-in, and are you looking to finance or pay cash?'
    },
    {
      side: 'customer',
      text: 'I have a 2020 Explorer, about 38k miles. And I would probably finance.'
    },
    {
      side: 'ai',
      text: 'Perfect — I am building your deal summary now with a trade-in estimate and financing options. A sales manager will review it and send you a firm offer shortly. What is the best email to reach you?'
    }
  ];

  // Timings (ms): when each message is SHOWN
  // Customer messages appear quickly; AI messages have a typing delay built in
  const SHOW_AT = [1500, 6500, 12000, 18000];

  // Typing indicator appears this many ms BEFORE the AI message
  const TYPING_LEAD = 2400;

  let container;
  let pendingTimers = [];

  function getContainer() {
    return document.getElementById('chatMessages');
  }

  function scheduleAll() {
    container = getContainer();
    if (!container) return;

    SCRIPT.forEach((msg, i) => {
      const showAt = SHOW_AT[i];

      if (msg.side === 'ai') {
        // Show typing indicator TYPING_LEAD ms before the message
        const typingAt = showAt - TYPING_LEAD;
        const t1 = setTimeout(() => addTyping(), typingAt);
        pendingTimers.push(t1);
      }

      const t2 = setTimeout(() => {
        removeTyping();
        addMessage(msg.side, msg.text);

        // After last message, pause then restart
        if (i === SCRIPT.length - 1) {
          const t3 = setTimeout(() => {
            clearChat();
            scheduleAll();
          }, 4500);
          pendingTimers.push(t3);
        }
      }, showAt);

      pendingTimers.push(t2);
    });
  }

  function clearTimers() {
    pendingTimers.forEach(clearTimeout);
    pendingTimers = [];
  }

  function clearChat() {
    clearTimers();
    container = getContainer();
    if (!container) return;
    // Keep only the intro pill (first child)
    while (container.children.length > 1) {
      container.removeChild(container.lastChild);
    }
  }

  function addMessage(side, text) {
    container = getContainer();
    if (!container) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg from-' + side;

    const sender = document.createElement('div');
    sender.className = 'msg-sender';
    sender.textContent = side === 'customer' ? 'Visitor' : 'Autoharmony';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble';
    bubble.textContent = text;

    wrapper.appendChild(sender);
    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;

    // Two rAFs to ensure the element is painted before transitioning
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.classList.add('visible');
      });
    });
  }

  function addTyping() {
    container = getContainer();
    if (!container) return;

    // Don't add a second typing indicator
    if (container.querySelector('#chatTyping')) return;

    const wrapper = document.createElement('div');
    wrapper.className = 'chat-msg from-ai';
    wrapper.id = 'chatTyping';

    const sender = document.createElement('div');
    sender.className = 'msg-sender';
    sender.textContent = 'Autoharmony';

    const bubble = document.createElement('div');
    bubble.className = 'msg-bubble msg-typing';
    bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

    wrapper.appendChild(sender);
    wrapper.appendChild(bubble);
    container.appendChild(wrapper);
    container.scrollTop = container.scrollHeight;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        wrapper.classList.add('visible');
      });
    });
  }

  function removeTyping() {
    const el = document.getElementById('chatTyping');
    if (el) el.remove();
  }

  // Start when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    scheduleAll();
  });

})();


/* =============================================
   PROCESS TIMELINE ANIMATION
   ============================================= */
(function initProcess() {

  document.addEventListener('DOMContentLoaded', () => {
    const track = document.getElementById('processTrack');
    const fill  = document.getElementById('processLineFill');
    const steps = document.querySelectorAll('.pstep');

    if (!track || !fill || !steps.length) return;

    let triggered = false;

    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !triggered) {
        triggered = true;
        runSequence();
      }
    }, { threshold: 0.25 });

    observer.observe(track);

    function runSequence() {
      steps.forEach((step, i) => {
        const delay = i * 450;

        // Make step visible
        setTimeout(() => {
          step.classList.add('visible');
        }, delay);

        // Activate dot with slight extra delay for line-then-dot feel
        setTimeout(() => {
          // Mark previous as done
          if (i > 0) steps[i - 1].classList.replace('active', 'done');
          step.classList.add('active');

          // Advance the progress line
          const pct = ((i + 1) / steps.length) * 100;
          fill.style.width = pct + '%';
        }, delay + 80);
      });

      // After all done, clean up last active
      setTimeout(() => {
        const lastActive = track.querySelector('.active');
        if (lastActive) lastActive.classList.replace('active', 'done');
      }, steps.length * 450 + 300);
    }
  });

})();


/* =============================================
   SCROLL REVEAL
   ============================================= */
(function initReveal() {

  document.addEventListener('DOMContentLoaded', () => {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;

    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    els.forEach(el => observer.observe(el));
  });

})();


/* =============================================
   NAV SCROLL STATE
   ============================================= */
(function initNav() {

  document.addEventListener('DOMContentLoaded', () => {
    const nav = document.getElementById('nav');
    if (!nav) return;

    const onScroll = () => {
      nav.classList.toggle('scrolled', window.scrollY > 30);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  });

})();


/* =============================================
   FORM SUBMISSION (GOOGLE FORMS INTEGRATION)
   ============================================= */
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('demoForm');
  const iframe = document.getElementById('hidden_iframe');
  const btn = document.getElementById('submitBtn');
  let isSubmitting = false;

  if (!form || !iframe || !btn) return;

  // 1. Handle Form Validation on Submit
  form.addEventListener('submit', (e) => {
    const nameEl  = document.getElementById('fname');
    const emailEl = document.getElementById('femail');
    const dealEl  = document.getElementById('fdealership');

    const name  = nameEl.value.trim();
    const email = emailEl.value.trim();
    const deal  = dealEl.value.trim();

    // If validation fails, stop the form from sending to Google
    if (!name || !email || !deal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.preventDefault();
      if (!name) highlightError(nameEl);
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) highlightError(emailEl);
      if (!deal) highlightError(dealEl);
      return;
    }

    // Switch button to loading state
    isSubmitting = true;
    btn.disabled = true;
    btn.innerHTML = 'Sending...';
  });

  // 2. Catch Google's response via the hidden iframe
  iframe.addEventListener('load', () => {
    if (isSubmitting) {
      // Trigger your success visual state
      btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M2 8L6.5 12.5L14 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Request Received!';
      btn.style.background = '#22C55E';
      btn.style.boxShadow  = '0 8px 24px rgba(34,197,94,.35)';
      
      isSubmitting = false;
      form.reset(); // Clear the inputs
    }
  });
});

/* =============================================
   VALIDATION ERROR HELPER FUNCTION
   ============================================= */
function highlightError(input) {
  input.style.borderColor = '#FF6B6B';
  input.style.boxShadow = '0 0 0 4px rgba(255, 107, 107, 0.15)';
  
  function reset() {
    input.style.borderColor = '';
    input.style.boxShadow = '';
    input.removeEventListener('input', reset);
  }

  input.addEventListener('input', reset);

  // Also auto-reset after 2.5s even if user doesn't type
  setTimeout(reset, 2500);
}
