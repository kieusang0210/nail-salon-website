document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. NAVIGATION & MOBILE MENU
       ========================================================================== */
    const header = document.querySelector('.header');
    const menuToggle = document.getElementById('menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileLinks = document.querySelectorAll('.mobile-link');
    const navLinks = document.querySelectorAll('.nav-link');

    // Sticky Header Scroll Effect
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        // Active Nav Link highlight on Scroll
        let currentSection = '';
        const sections = document.querySelectorAll('section, main');
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - 150)) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === currentSection) {
                link.classList.add('active');
            }
        });
    });

    // Toggle Mobile Menu
    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('active');
        mobileMenu.classList.toggle('open');
        document.body.classList.toggle('no-scroll');
    });

    // Close Mobile Menu on Link Click
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('active');
            mobileMenu.classList.remove('open');
            document.body.classList.remove('no-scroll');
        });
    });


    /* ==========================================================================
       2. FILTERABLE WORK GALLERY
       ========================================================================== */
    const filterTabs = document.querySelectorAll('.filter-tab');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active state
            filterTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');

            const filterValue = tab.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const categories = item.getAttribute('data-category');
                
                if (filterValue === 'all' || categories.includes(filterValue)) {
                    item.classList.remove('hidden');
                    // Add modern fade-in transition
                    item.style.opacity = '0';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 50);
                } else {
                    item.classList.add('hidden');
                }
            });
        });
    });


    /* ==========================================================================
       3. REVIEWS SLIDER / CAROUSEL
       ========================================================================== */
    const reviewSlides = document.querySelectorAll('.review-slide');
    const carouselDots = document.querySelectorAll('.carousel-dots .dot');
    let currentSlide = 0;
    let slideInterval;

    function showSlide(index) {
        reviewSlides.forEach(slide => slide.classList.remove('active'));
        carouselDots.forEach(dot => dot.classList.remove('active'));

        reviewSlides[index].classList.add('active');
        carouselDots[index].classList.add('active');
        currentSlide = index;
    }

    function nextSlide() {
        let index = currentSlide + 1;
        if (index >= reviewSlides.length) index = 0;
        showSlide(index);
    }

    // Dot click controls
    carouselDots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            clearInterval(slideInterval);
            showSlide(idx);
            startAutoplay();
        });
    });

    function startAutoplay() {
        slideInterval = setInterval(nextSlide, 6000);
    }

    startAutoplay();


    /* ==========================================================================
       4. PROMO BANNER / TOAST NOTIFICATION
       ========================================================================== */
    const claimOfferBtn = document.getElementById('claim-offer-btn');
    const promoToast = document.getElementById('promo-toast');
    let promoClaimed = false;

    if (claimOfferBtn) {
        claimOfferBtn.addEventListener('click', () => {
            promoClaimed = true;
            
            // Show toast message
            promoToast.classList.add('show');
            
            // Auto close toast
            setTimeout(() => {
                promoToast.classList.remove('show');
            }, 4500);

            // Directly launch the booking wizard modal!
            openBookingModal();
        });
    }


    /* ==========================================================================
       5. INTERACTIVE APPOINTMENT BOOKING WIZARD
       ========================================================================== */
    const bookingModal = document.getElementById('booking-modal');
    const btnBookTriggers = document.querySelectorAll('.btn-book-trigger, .btn-book-trigger-service');
    const modalCloseBtn = document.getElementById('modal-close-btn');
    
    // Booking State Variables
    let selectedServices = [];
    let selectedArtist = "Any Available Technician";
    let selectedDate = "";
    let selectedTime = "11:30 AM";
    let subtotalPrice = 0;

    // Helper: Format Date beautifully
    function formatBookingDate(dateString) {
        if (!dateString) return "";
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const date = new Date(dateString + 'T00:00:00'); // Prevent timezone offset issues
        return date.toLocaleDateString('en-US', options);
    }

    // Open/Close Modal Functions
    function openBookingModal(initialService = null) {
        bookingModal.classList.add('open');
        document.body.classList.add('no-scroll');
        
        // Reset panels to Step 1
        resetWizard();

        // Preset service if user clicked a service card's book button
        if (initialService) {
            const checkboxes = document.querySelectorAll('input[name="booking-service"]');
            checkboxes.forEach(box => {
                if (box.value.toLowerCase().includes(initialService.toLowerCase())) {
                    box.checked = true;
                } else {
                    box.checked = false;
                }
            });
        }
        
        updateTotalServicePrice();
    }

    function closeBookingModal() {
        bookingModal.classList.remove('open');
        document.body.classList.remove('no-scroll');
    }

    // Setup triggers
    btnBookTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const specificService = trigger.getAttribute('data-service');
            openBookingModal(specificService);
        });
    });

    modalCloseBtn.addEventListener('click', closeBookingModal);
    
    // Close modal if clicking outside the card
    bookingModal.addEventListener('click', (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });

    // Preset Date to Today's date (and limit min date to today)
    const dateInput = document.getElementById('booking-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1; // Months start at 0
        let dd = today.getDate();

        if (mm < 10) mm = '0' + mm;
        if (dd < 10) dd = '0' + dd;

        const formattedToday = yyyy + '-' + mm + '-' + dd;
        dateInput.min = formattedToday;
        dateInput.value = formattedToday;
        selectedDate = formattedToday;
    }

    /* Step Navigation Controls */
    const stepDots = document.querySelectorAll('.step-dot');
    const stepLines = document.querySelectorAll('.step-line');
    const panels = document.querySelectorAll('.wizard-panel');

    function resetWizard() {
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('panel-step-1').classList.add('active');

        stepDots.forEach(dot => {
            dot.classList.remove('active', 'completed');
            dot.innerHTML = dot.getAttribute('data-step');
        });
        stepDots[0].classList.add('active');

        stepLines.forEach(line => line.classList.remove('completed'));
    }

    function goToPanel(stepNumber) {
        panels.forEach(p => p.classList.remove('active'));
        const targetPanel = document.getElementById(`panel-step-${stepNumber}`);
        if (targetPanel) {
            targetPanel.classList.add('active');
        }

        // Update indicators
        stepDots.forEach((dot, idx) => {
            const dotStep = idx + 1;
            dot.classList.remove('active');
            
            if (dotStep < stepNumber) {
                dot.classList.add('completed');
                dot.innerHTML = '<i class="fa-solid fa-check"></i>';
            } else if (dotStep === stepNumber) {
                dot.classList.remove('completed');
                dot.classList.add('active');
                dot.innerHTML = dotStep;
            } else {
                dot.classList.remove('completed', 'active');
                dot.innerHTML = dotStep;
            }
        });

        stepLines.forEach((line, idx) => {
            const lineStep = idx + 1;
            if (lineStep < stepNumber) {
                line.classList.add('completed');
            } else {
                line.classList.remove('completed');
            }
        });
    }

    /* STEP 1: SERVICE MULTI-SELECT & SUM CALCULATIONS */
    const serviceCheckboxes = document.querySelectorAll('input[name="booking-service"]');
    const tempTotalDisplay = document.getElementById('temp-total-price');

    function updateTotalServicePrice() {
        subtotalPrice = 0;
        selectedServices = [];

        serviceCheckboxes.forEach(box => {
            if (box.checked) {
                const price = parseFloat(box.getAttribute('data-price'));
                subtotalPrice += price;
                selectedServices.push(box.value);
            }
        });

        tempTotalDisplay.textContent = `$${subtotalPrice}`;
    }

    serviceCheckboxes.forEach(box => {
        box.addEventListener('change', updateTotalServicePrice);
    });

    document.getElementById('btn-next-step-1').addEventListener('click', () => {
        if (selectedServices.length === 0) {
            alert('Please select at least one nail service to continue.');
            return;
        }
        goToPanel(2);
    });

    /* STEP 2: ARTIST SELECT RADIOS */
    const artistSelectItems = document.querySelectorAll('.artist-select-item');

    artistSelectItems.forEach(item => {
        item.addEventListener('click', () => {
            artistSelectItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
            
            const radio = item.querySelector('input[type="radio"]');
            if (radio) {
                radio.checked = true;
                selectedArtist = radio.value;
            }
        });
    });

    document.getElementById('btn-prev-step-2').addEventListener('click', () => goToPanel(1));
    document.getElementById('btn-next-step-2').addEventListener('click', () => goToPanel(3));

    /* STEP 3: DATE & TIME SELECTOR */
    const timeSlots = document.querySelectorAll('.time-slot-btn');

    timeSlots.forEach(slot => {
        slot.addEventListener('click', () => {
            timeSlots.forEach(s => s.classList.remove('active'));
            slot.classList.add('active');
            selectedTime = slot.getAttribute('data-time');
        });
    });

    dateInput.addEventListener('change', () => {
        selectedDate = dateInput.value;
    });

    document.getElementById('btn-prev-step-3').addEventListener('click', () => goToPanel(2));
    document.getElementById('btn-next-step-3').addEventListener('click', () => {
        if (!selectedDate) {
            alert('Please select a preferred date.');
            return;
        }
        
        // Compile receipt before entering panel 4
        compileReceiptDetails();
        goToPanel(4);
    });

    /* STEP 4: FORM SUBMIT & FINAL COMPILATIONS */
    function compileReceiptDetails() {
        const receiptServices = document.getElementById('receipt-services');
        const receiptArtist = document.getElementById('receipt-artist');
        const receiptDatetime = document.getElementById('receipt-datetime');
        const receiptPrice = document.getElementById('receipt-price');

        // Services string
        receiptServices.textContent = selectedServices.join(', ');
        
        // Artist string
        receiptArtist.textContent = selectedArtist;

        // Datetime
        receiptDatetime.textContent = `${formatBookingDate(selectedDate)} at ${selectedTime}`;

        // Compute Price with Promo Discount if applicable
        let finalPrice = subtotalPrice;
        if (promoClaimed) {
            finalPrice = subtotalPrice * 0.90; // 10% off
            receiptPrice.innerHTML = `<span style="text-decoration: line-through; font-size: 0.85rem; color: var(--text-light); font-weight: normal; margin-right: 8px;">$${subtotalPrice.toFixed(2)}</span> $${finalPrice.toFixed(2)} <span style="font-size: 0.7rem; color: var(--success-color); font-weight: bold; display: block;">(10% Welcome Discount Applied)</span>`;
        } else {
            receiptPrice.textContent = `$${finalPrice.toFixed(2)}`;
        }
    }

    document.getElementById('btn-prev-step-4').addEventListener('click', () => goToPanel(3));

    const bookingForm = document.getElementById('booking-form');
    bookingForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Read Client Information
        const clientName = document.getElementById('cust-name').value;
        const clientPhone = document.getElementById('cust-phone').value;
        const clientEmail = document.getElementById('cust-email').value;

        // Perform final transitions
        const finalDatetime = document.getElementById('final-datetime');
        const finalArtist = document.getElementById('final-artist');
        const finalPrice = document.getElementById('final-price');

        finalDatetime.textContent = `${formatBookingDate(selectedDate)} at ${selectedTime}`;
        finalArtist.textContent = selectedArtist;

        let computedFinal = subtotalPrice;
        if (promoClaimed) {
            computedFinal = subtotalPrice * 0.90;
        }
        finalPrice.textContent = `$${computedFinal.toFixed(2)}`;

        // Show Success Panel
        panels.forEach(p => p.classList.remove('active'));
        document.getElementById('panel-success').classList.add('active');

        // Mark all steps as complete
        stepDots.forEach(dot => {
            dot.classList.add('completed');
            dot.innerHTML = '<i class="fa-solid fa-check"></i>';
        });
        stepLines.forEach(line => line.classList.add('completed'));
    });

    /* SUCCESS ACTIONS */
    document.getElementById('btn-close-success').addEventListener('click', () => {
        closeBookingModal();
        bookingForm.reset();
        resetWizard();
    });

    // Calendar Integration Simulation
    document.getElementById('btn-calendar-add').addEventListener('click', () => {
        alert(`Awesome! Luxe Nail Appointment added to your Google Calendar for ${formatBookingDate(selectedDate)} at ${selectedTime}. An email invite has been sent to your inbox.`);
    });
});
