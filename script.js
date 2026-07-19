document.addEventListener('DOMContentLoaded', function() {
    // Loading Screen
    setTimeout(() => {
        document.getElementById('loadingScreen').classList.add('hidden');
    }, 2000);

    // Navbar Scroll
    const navbar = document.getElementById('navbar');
    const scrollTopBtn = document.getElementById('scrollTop');
    
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 100);
        scrollTopBtn.classList.toggle('visible', window.scrollY > 100);
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Mobile Menu
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');

    mobileMenuBtn.addEventListener('click', function() {
        this.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // Active Nav Link
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY > top && scrollY <= top + height) {
                document.querySelectorAll('.nav-links a').forEach(a => {
                    a.classList.remove('active');
                    if (a.getAttribute('href') === '#' + id) {
                        a.classList.add('active');
                    }
                });
            }
        });
    });

    // Stats Counter
    const statNumbers = document.querySelectorAll('.stat-number-large');
    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.target);
                animateCounter(entry.target, 0, target, 2000);
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    statNumbers.forEach(num => statsObserver.observe(num));

    function animateCounter(element, start, end, duration) {
        const startTime = performance.now();
        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.floor(start + (end - start) * easeOut);
            element.textContent = current.toLocaleString('ar-SA');
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    // Scroll Animations
    const scrollElements = document.querySelectorAll('.department-card, .doctor-card, .stat-card');
    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
            }
        });
    }, { threshold: 0.1 });

    scrollElements.forEach(el => {
        el.classList.add('scroll-animate');
        scrollObserver.observe(el);
    });

    // ===== Chat Functionality (AJAX) =====
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');
    const chatMessages = document.getElementById('chatMessages');
    const chatTyping = document.querySelector('.chat-typing');

    function addMessage(text, isUser = true) {
        const div = document.createElement('div');
        div.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        div.innerHTML = `
            ${isUser ? `<span>${text}</span>` : ''}
            <div class="avatar ${isUser ? 'user-avatar' : 'bot-avatar'}">
                <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
            </div>
            ${!isUser ? `<span>${text}</span>` : ''}
        `;
        chatMessages.appendChild(div);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    async function sendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;

        addMessage(message, true);
        chatInput.value = '';
        chatTyping.style.display = 'flex';

        try {
            const formData = new FormData();
            formData.append('action', 'chat');
            formData.append('message', message);
            formData.append('session_id', CHAT_SESSION_ID);

            const response = await fetch('index.php', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();
            
            chatTyping.style.display = 'none';
            
            if (data.success) {
                addMessage(data.response, false);
            } else {
                addMessage('عذراً، حدث خطأ. يرجى المحاولة مرة أخرى.', false);
            }
        } catch (error) {
            chatTyping.style.display = 'none';
            addMessage('عذراً، لا يمكن الاتصال بالخادم. يرجى المحاولة لاحقاً.', false);
        }
    }

    chatSend.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Floating Chat Button
    document.getElementById('floatingChatBtn').addEventListener('click', () => {
        document.querySelector('.chat-interface').scrollIntoView({ behavior: 'smooth', block: 'center' });
    });

    // ===== Department/Doctor Selection (AJAX) =====
    const departmentSelect = document.getElementById('departmentSelect');
    const doctorSelect = document.getElementById('doctorSelect');

    if (departmentSelect) {
        departmentSelect.addEventListener('change', async function() {
            const departmentId = this.value;
            doctorSelect.innerHTML = '<option value="">جاري التحميل...</option>';

            if (departmentId) {
                try {
                    const response = await fetch(`?action=get_doctors&department_id=${departmentId}`);
                    const doctors = await response.json();
                    
                    doctorSelect.innerHTML = '<option value="">اختر الطبيب (اختياري)</option>';
                    doctors.forEach(doctor => {
                        doctorSelect.innerHTML += `<option value="${doctor.id}">${doctor.name} - ${doctor.specialty}</option>`;
                    });
                } catch (error) {
                    doctorSelect.innerHTML = '<option value="">اختر الطبيب (اختياري)</option>';
                }
            } else {
                doctorSelect.innerHTML = '<option value="">اختر الطبيب (اختياري)</option>';
            }
        });
    }

    // ===== Appointment Form =====
    const appointmentForm = document.getElementById('appointmentForm');
    if (appointmentForm) {
        appointmentForm.addEventListener('submit', function(e) {
            const btn = this.querySelector('button[type="submit"]');
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحجز...';
            btn.disabled = true;
        });
    }

    // Smooth Scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Global function for scrollToChat
function scrollToChat() {
    document.querySelector('.chat-interface').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
