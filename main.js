/* =============================================
   AutoAI Sales — main.js
   ============================================= */

/* ---- Chat Demo ---- */
const CONVERSATION = [
  { side: 'customer', sender: 'Visitor',  text: 'Hi, I'm interested in the 2024 F-150 XLT — what's the best price you can do?' },
  { side: 'ai',       sender: 'AutoAI',   text: 'Great choice! I'd love to help you get into that F-150. To give you an accurate number, do you have a trade-in, and are you looking to finance or pay cash?' },
  { side: 'customer', sender: 'Visitor',  text: 'I have a 2019 Explorer and I'd probably finance.' },
  { side: 'ai',       sender: 'AutoAI',   text: 'Perfect — I'm pulling together a deal summary with trade-in estimate and financing options now. One of our sales managers will review and send you a firm offer shortly. What's the best email to reach you?' },
];

const DELAYS    = [600, 2200, 4800, 7200];   // when each message appears
const AI_TYPING = [1400, 3800, 6200];         // typing indicator for AI replies

let chatContainer;
let resetTimer;

function buildChatUI() {
  chatContainer = document.getElementById('chatMessages');
  if (!chatContainer) return;
  renderChat();
}

function renderChat() {
  chatContainer.innerHTML = '';

  // Schedule typing indicators + messages
  CONVERSATION.forEach((msg, i) => {
    const delay = DELAYS[i];

    if (msg.side === 'ai') {
      const typingDelay = AI_TYPING[Math.floor(i / 2)];
      setTimeout(() => showTyping(), typingDelay);
    }

    setTimeout(() => {
      removeTyping();
      showMessage(msg);

      // After last message, restart loop
      if (i === CONVERSATION.length - 1) {
        resetTimer = setTimeout(() => {
          chatContainer.innerHTML = '';
          renderChat();
        }, 5000);
      }
    }, delay);
  });
}

function showMessage(msg) {
  const wrapper = document.createElement('div');
  wrapper.className = `chat-msg from-${msg.side === 'customer' ? 'customer' : 'ai'}`;

  const sender = document.createElement('div');
  sender.className = 'msg-sender';
  sender.textContent = msg.sender;

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = msg.text;

  wrapper.appendChild(sender);
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  // Scroll to latest
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Trigger animation
  requestAnimationFrame(() => {
    requestAnimationFrame(() => wrapper.classList.add('visible'));
  });
}

function showTyping() {
  const wrapper = document.createElement('div');
  wrapper.className = 'chat-msg from-ai';
  wrapper.id = 'typingIndicator';

  const sender = document.createElement('div');
  sender.className = 'msg-sender';
  sender.textContent = 'AutoAI';

  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble msg-typing';
  bubble.innerHTML = '<div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div>';

  wrapper.appendChild(sender);
  wrapper.appendChild(bubble);
  chatContainer.appendChild(wrapper);

  chatContainer.scrollTop = chatContainer.scrollHeight;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => wrapper.classList.add('visible'));
  });
}

function removeTyping() {
  const el = document.getElementById('typingIndicator');
  if (el) el.remove();
}


/* ---- Process Timeline Animation ---- */
function initProcessAnimation() {
  const fill  = document.getElementById('processLineFill');
  const steps = document.querySelectorAll('.pstep');
  if (!fill || !steps.length) return;

  let done = false;

  const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !done) {
      done = true;
      animateSteps(fill, steps);
    }
  }, { threshold: 0.3 });

  observer.observe(document.querySelector('.process-track'));
}

function animateSteps(fill, steps) {
  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('visible', 'active');

      // Update line fill
      const pct = ((i + 1) / steps.length) * 100;
      fill.style.width = pct + '%';

      // Remove active from all except current
      steps.forEach((s, j) => {
        if (j < i) s.classList.remove('active');
      });
    }, i * 400);
  });
}


/* ---- Generic Scroll Fade-up ---- */
function initFadeUps() {
  const targets = document.querySelectorAll(
    '.problem-card, .outcome-card, .comp-card, .pstep, .risk-banner, .cta-left, .form-card'
  );

  targets.forEach(el => el.classList.add('fade-up'));

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}


/* ---- Nav scroll state ---- */
function initNavScroll() {
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 20
      ? 'rgba(9,9,15,.95)'
      : 'rgba(9,9,15,.88)';
  }, { passive: true });
}


/* ---- Form Submit ---- */
function handleSubmit() {
  const name       = document.getElementById('name')?.value.trim();
  const email      = document.getElementById('email')?.value.trim();
  const dealership = document.getElementById('dealership')?.value.trim();
  const btn        = document.getElementById('submitBtn');

  if (!name || !email || !dealership) {
    shakeField(!name ? 'name' : !email ? 'email' : 'dealership');
    return;
  }

  btn.textContent  = '✓ Request Received';
  btn.style.background = '#22C55E';
  btn.disabled     = true;
}

function shakeField(id) {
  const input = document.getElementById(id);
  if (!input) return;

  input.focus();
  input.style.borderColor = '#FF6B6B';
  input.style.boxShadow   = '0 0 0 3px rgba(255,107,107,.2)';

  setTimeout(() => {
    input.style.borderColor = '';
    input.style.boxShadow   = '';
  }, 1800);
}


/* ---- Respect reduced-motion preference ---- */
function respectReducedMotion() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.fade-up').forEach(el => {
      el.classList.add('in-view');
    });
  }
}


/* ---- Init ---- */
document.addEventListener('DOMContentLoaded', () => {
  buildChatUI();
  initProcessAnimation();
  initFadeUps();
  initNavScroll();
  respectReducedMotion();
});
