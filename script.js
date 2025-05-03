document.addEventListener('DOMContentLoaded', function() {
    // Slideshow functionality
    let slideIndex = 1;
    showSlide(slideIndex);
    
    // Auto advance slideshow every 5 seconds
    setInterval(function() {
        plusSlide(1);
    }, 5000);
    
    // Make slideshow functions available globally
    window.plusSlide = function(n) {
        showSlide(slideIndex += n);
    };
    
    window.currentSlide = function(n) {
        showSlide(slideIndex = n);
    };
    
    function showSlide(n) {
        const slides = document.getElementsByClassName("slide");
        const dots = document.getElementsByClassName("dot");
        
        if (n > slides.length) {
            slideIndex = 1;
        }
        if (n < 1) {
            slideIndex = slides.length;
        }
        
        // Hide all slides
        for (let i = 0; i < slides.length; i++) {
            slides[i].classList.remove("active");
            slides[i].style.display = "none";
        }
        
        // Remove active class from all dots
        for (let i = 0; i < dots.length; i++) {
            dots[i].classList.remove("active");
        }
        
        // Show the current slide and activate the dot
        slides[slideIndex - 1].style.display = "block";
        slides[slideIndex - 1].classList.add("active");
        dots[slideIndex - 1].classList.add("active");
    }
    // Add fixed header class on scroll
    const header = document.querySelector('header');
    const heroSection = document.querySelector('.hero');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset;
                
                window.scrollTo({
                    top: targetPosition - headerHeight,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Mobile menu toggle
    const menuToggle = document.createElement('div');
    menuToggle.className = 'menu-toggle';
    menuToggle.innerHTML = '<span></span><span></span><span></span>';
    
    const nav = document.querySelector('nav');
    
    if (window.innerWidth <= 576) {
        header.appendChild(menuToggle);
        
        menuToggle.addEventListener('click', function() {
            nav.classList.toggle('active');
            this.classList.toggle('active');
        });
    }
    
    // Resize event for responsive behavior
    window.addEventListener('resize', function() {
        if (window.innerWidth <= 576) {
            if (!document.querySelector('.menu-toggle')) {
                header.appendChild(menuToggle);
            }
        } else {
            if (document.querySelector('.menu-toggle')) {
                document.querySelector('.menu-toggle').remove();
                nav.classList.remove('active');
            }
        }
    });
    
    // Add CSS for mobile menu toggle
    if (!document.getElementById('mobile-menu-styles')) {
        const style = document.createElement('style');
        style.id = 'mobile-menu-styles';
        style.textContent = `
            @media (max-width: 576px) {
                nav {
                    display: none;
                    position: absolute;
                    top: 70px;
                    left: 0;
                    width: 100%;
                    background: white;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    padding: 20px;
                }
                
                nav.active {
                    display: block;
                }
                
                nav ul {
                    flex-direction: column;
                }
                
                nav ul li {
                    margin: 0 0 15px 0;
                }
                
                .menu-toggle {
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    width: 30px;
                    height: 21px;
                    cursor: pointer;
                }
                
                .menu-toggle span {
                    display: block;
                    height: 3px;
                    width: 100%;
                    background-color: var(--text-color);
                    border-radius: 3px;
                    transition: all 0.3s ease;
                }
                
                .menu-toggle.active span:nth-child(1) {
                    transform: translateY(9px) rotate(45deg);
                }
                
                .menu-toggle.active span:nth-child(2) {
                    opacity: 0;
                }
                
                .menu-toggle.active span:nth-child(3) {
                    transform: translateY(-9px) rotate(-45deg);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Animation on scroll
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .browser-card');
        
        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;
            
            if (elementPosition < screenPosition) {
                element.classList.add('animate');
            }
        });
    };
    
    // Add animation CSS
    const animationStyle = document.createElement('style');
    animationStyle.textContent = `
        .feature-card, .browser-card {
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .feature-card.animate, .browser-card.animate {
            opacity: 1;
            transform: translateY(0);
        }
        
        .feature-card:nth-child(2), .browser-card:nth-child(2) {
            transition-delay: 0.2s;
        }
        
        .feature-card:nth-child(3) {
            transition-delay: 0.4s;
        }
        
        .feature-card:nth-child(4) {
            transition-delay: 0.6s;
        }
        
        .feature-card:nth-child(5) {
            transition-delay: 0.8s;
        }
        
        .feature-card:nth-child(6) {
            transition-delay: 1s;
        }
    `;
    document.head.appendChild(animationStyle);
    
    // Run animation on scroll
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Run once on load
});