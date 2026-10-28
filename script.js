/**
 * StagePass shared behavior (loaded by index.html, checkout.html, ticket.html).
 *
 * HOW THIS FILE IS ORGANIZED (top to bottom):
 *   1. Shared page elements
 *   2. Mobile menu
 *   3. Dark mode
 *   4. Event data (the "database" for the prototype)
 *   5. Choosing which event to show
 *   6. Filling Checkout / Ticket pages with that event's details
 *   7. Image fallbacks
 *   8. Home page: remember clicked event + search/category filtering
 *   9. Checkout page: option buttons, hold timer, card formatting, purchase animation
 *  10. Mobile bottom navigation highlight
 *
 * Every page loads this same file. Each section checks that its elements exist
 * before doing anything, so code for one page quietly does nothing on the others.
 */

// 1. SHARED PAGE ELEMENTS -----------------------------------------------------
// Looked up once and reused below.
const body = document.body;
const page = body.dataset.page; // 'home', 'checkout', or 'ticket' (set on <body> in each HTML file)
const menuButton = document.querySelector('.menu-button');
const mobileMenu = document.querySelector('.mobile-menu');
const themeCheckboxes = document.querySelectorAll('.theme-checkbox');


// 2. MOBILE MENU --------------------------------------------------------------
// The hamburger button opens/closes the same links shown in the desktop nav.
// On desktop, CSS hides both the button and this menu.
if (menuButton && mobileMenu) {
  /**
   * Opens or closes the mobile menu and keeps the button in sync
   * (icon and accessibility labels for screen readers).
   * @param {boolean} isOpen - true to open the menu, false to close it.
   */
  function setMenuOpen(isOpen) {
    mobileMenu.classList.toggle('open', isOpen); // CSS shows the menu when .open is present
    menuButton.setAttribute('aria-expanded', String(isOpen));
    menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
    menuButton.textContent = isOpen ? '×' : '☰';
  }

  // Tap the hamburger to flip between open and closed.
  menuButton.addEventListener('click', () => {
    setMenuOpen(!mobileMenu.classList.contains('open'));
  });

  // Close the menu after any link inside it is tapped.
  mobileMenu.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => setMenuOpen(false));
  });

  // Pressing Escape closes the menu and returns focus to the button (keyboard accessibility).
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && mobileMenu.classList.contains('open')) {
      setMenuOpen(false);
      menuButton.focus();
    }
  });
}


// 3. DARK MODE ----------------------------------------------------------------
// The choice is saved in localStorage so every page uses the same theme.
// Dark mode = the "dark-mode" class on <body>; styles.css swaps colors based on it.
if (localStorage.getItem('stagepass-theme') === 'dark') {
  body.classList.add('dark-mode');
}

/**
 * Makes every dark-mode switch (header and mobile) match the current theme,
 * and updates the label text ("Dark Mode" / "Light Mode").
 */
function syncThemeControls() {
  const isDark = body.classList.contains('dark-mode');

  themeCheckboxes.forEach((checkbox) => {
    checkbox.checked = isDark;
  });

  document.querySelectorAll('.theme-label').forEach((label) => {
    label.textContent = isDark ? 'Light Mode' : 'Dark Mode';
  });
}

syncThemeControls(); // Run once on page load so the switch matches the saved theme.

// When a switch is flipped: update the theme, save it, then refresh all switches.
themeCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    body.classList.toggle('dark-mode', checkbox.checked);
    localStorage.setItem('stagepass-theme', checkbox.checked ? 'dark' : 'light');
    syncThemeControls();
  });
});


// 4. EVENT DATA ---------------------------------------------------------------
// A small local "database" so no backend is needed.
// Each key (like 'don-toliver') must match the ?event=... value in the links on index.html.
// TO ADD AN EVENT: add a new entry here AND a matching card in index.html.

// Details every event shares in this prototype (each entry below copies these in).
const defaultTicketInfo = {
  ticketCount: '2 Tickets',
  ticketPrice: '$146.00',
  fees: '$22.00',
  totalPrice: '$168.00'
};

const eventCatalog = {
  'don-toliver': {
    ...defaultTicketInfo,
    name: 'Don Toliver',
    tour: 'Octane Tour',
    venue: 'Spectrum Center · Charlotte, NC',
    genre: 'Hip-Hop/Rap',
    bio: 'Caleb Zackery "Don" Toliver, born June 12, 1994 is an American rapper, singer and songwriter. His debut mixtape, Donny Womack (2018), was released one day prior to fellow Houston rapper Travis Scotts album Astroworld, on which Toliver made a guest appearance. In the following week, he signed with Scotts record label, Cactus Jack Records, in a joint venture with Atlantic Records.',
    concerts: [
            { date: 'August 20th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Miami, FL - Watsco Center', name: 'Don Toliver: Octane' },
            { date: 'October 30th, 2026', day: 'Saturday', time: '8:00 PM', venue: 'Charlotte, NC - Spectrum Center', name: 'Don Toliver: Octane' },
            { date: 'September 3rd, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Chicago, IL - United Center', name: 'Don Toliver: Octane' }
        ],
    dateShort: 'Oct 30',
    dateShortUpper: 'OCT 30',
    dateFull: 'October 30, 2026',
    dateTime: '2026 · 8:00 PM',
    time: '8:00 PM',
    section: '112',
    row: 'J',
    seat: '8',
    image: 'https://i.scdn.co/image/ab6761610000e5ebeb63bf6379a9ea8453a30020',
    bannerImage: 'https://i.pinimg.com/736x/51/14/08/51140876116ccce357883864757c3538.jpg',
    fallback: 'assets/don-toliver.svg',
    ticketCode: 'STAGEPASS · DT-OCTANE-112-J-8'
  },
  'tame-impala': {
    ...defaultTicketInfo,
    name: 'Tame Impala',
    tour: 'DEADBEAT Tour',
    venue: 'Spectrum Center · Charlotte, NC',
    genre: 'Alternative/Pop',
    bio: 'Tame Impala is the psychedelic music project of Australian singer and multi-instrumentalist Kevin Parker. In the recording studio, Parker writes, records, performs, and produces the projects music. As a touring act, Tame Impala consists of Parker (vocals, guitar, synthesiser), Dominic Simper (guitar, synthesiser), Jay Watson (synthesiser, vocals, guitar), Cam Avery (bass guitar, vocals, synthesiser), Julien Barbagallo (drums, vocals), and James Ireland (guitar, synthesiser). The group has a close affiliation with fellow Australian psychedelic rock band Pond, sharing members and collaborators, including Watson, Ireland, and formerly Nick Allbrook. Originally signed to Modular Recordings, Tame Impala signed in 2015 to Interscope Records in the United States and Fiction Records in the United Kingdom.',
          concerts: [
            { date: 'August 1st, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Charlotte, NC - Spectrum Center', name: 'Tame Impala: Deadbeat' },
            { date: 'August 8th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Atlanta, GA - State Farm Arena', name: 'Tame Impala: Deadbeat' },
            { date: 'August 15th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Tampa, FL - Amalie Arena', name: 'Tame Impala: Deadbeat' }
        ],
    dateShort: 'Aug 1',
    dateFull: 'August 1, 2026',
    dateTime: '2026 · 8:00 PM',
    time: '8:00 PM',
    section: '104',
    row: 'G',
    seat: '12',
    ticketCount: '2 Tickets',
    ticketPrice: '$146.00',
    fees: '$22.00',
    totalPrice: '$168.00',
    image: 'https://i.pinimg.com/736x/cc/30/64/cc3064a72ff13c91053eb7d9305b2a1c.jpg',
    bannerImage: 'https://radiantefm.s3.us-west-2.amazonaws.com/2022/10/tame-impala.jpg',
    fallback: 'assets/tame-impala.svg',
    ticketCode: 'STAGEPASS · TI-DEADBEAT-104-G-12'
  },
  'olivia-rodrigo': {
    ...defaultTicketInfo,
    name: 'Olivia Rodrigo',
    tour: 'Live in Charlotte',
    venue: 'Spectrum Center · Charlotte, NC',
    genre: 'Pop',
    bio: 'Olivia Isabel Rodrigo (born February 20, 2003) is an American singer-songwriter and actress. Rodrigo began her career as a child actress, appearing in commercials and the direct-to-video film An American Girl: Grace Stirs Up Success (2015). She rose to prominence with her leading roles in the Disney Channel series Bizaardvark (2016–2019) and the Disney+ series High School Musical: The Musical: The Series (2019–2022).',
    concerts: [
            { date: 'October 22nd, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Los Angeles, CA - Crypto.com Arena', name: 'Olivia Rodrigo: GUTS' },
            { date: 'October 29th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'New York, NY - Madison Square Garden', name: 'Olivia Rodrigo: GUTS' },
            { date: 'November 21st, 2026', day: 'Saturday', time: '7:30 PM', venue: 'Charlotte, NC - Spectrum Center', name: 'Olivia Rodrigo: GUTS' }
        ],
    dateShort: 'Nov 21',
    dateFull: 'November 21, 2026',
    dateTime: '2026 · 7:30 PM',
    time: '7:30 PM',
    section: '118',
    row: 'F',
    seat: '15',
    ticketCount: '2 Tickets',
    ticketPrice: '$146.00',
    fees: '$22.00',
    totalPrice: '$168.00',
    image: 'https://i.pinimg.com/736x/cd/0b/e6/cd0be687d320b6cf3ec57c5844506235.jpg',
    bannerImage: 'https://i.pinimg.com/736x/e0/32/e3/e032e3266b42edfac1944db7c9c01964.jpg',
    fallback: 'assets/olivia-rodrigo.svg',
    ticketCode: 'STAGEPASS · OR-CHARLOTTE-118-F-15'
  },
  'the-weeknd': {
    ...defaultTicketInfo,
    name: 'The Weeknd',
    tour: 'After Hours Til Dawn',
    venue: 'Spectrum Center · Charlotte, NC',
    genre: 'R&B/Pop',
    bio: 'Abel Tesfaye (born Abel Makkonen Tesfaye, February 16, 1990), known professionally as the Weeknd, is a Canadian singer, songwriter, record producer, and actor.Regarded as an influential figure in popular music, he is known for his light-lyric tenor vocal range and falsetto, alternative R&B sound, and dark aesthetics, as well as the cinematic visuals and storytelling of his music videos. His accolades include 4 Grammy Awards, 20 Billboard Music Awards, 22 Juno Awards, 6 American Music Awards, 3 MTV Video Music Awards, and a Latin Grammy Award.',
    concerts: [
            { date: 'December 5th, 2026', day: 'Saturday', time: '8:00 PM', venue: 'Charlotte, NC - Spectrum Center', name: 'The Weeknd: After Hours Til Dawn' },
            { date: 'December 12th, 2026', day: 'Saturday', time: '8:00 PM', venue: 'Atlanta, GA - State Farm Arena', name: 'The Weeknd: After Hours Til Dawn' },
            { date: 'December 19th, 2026', day: 'Saturday', time: '8:00 PM', venue: 'Miami, FL - FTX Arena', name: 'The Weeknd: After Hours'}],
    dateShort: 'Dec 5',
    dateFull: 'December 5, 2026',
    dateTime: '2026 · 8:00 PM',
    time: '8:00 PM',
    section: '106',
    row: 'H',
    seat: '9',
    image: 'https://www.republicrecords.com/cdn/shop/files/TheWeeknd-Edit.jpg?v=1746649811&width=2752',
    bannerImage: 'https://i.pinimg.com/736x/50/91/13/509113f69957b8db5a2def0dcb034515.jpg',
    fallback: 'assets/the-weeknd.svg',
    ticketCode: 'STAGEPASS · TW-AFTERHOURS-106-H-9'
  },
  'all-time-low': {
    ...defaultTicketInfo,
    name: 'All Time Low',
    tour: "Everyone's Talking!",
    venue: 'Spectrum Center · Charlotte, NC',
    genre: 'Pop Punk',
    bio: 'All Time Low is an American rock band formed in Towson, Maryland, in 2003. Consisting of lead vocalist and rhythm guitarist Alex Gaskarth, lead guitarist Jack Barakat, bassist/backing vocalist Zack Merrick, and drummer Rian Dawson, the band took its name from lyrics in the song "Head on Collision" by New Found Glory. The band has consistently done year-long tours, headlined numerous tours, and has appeared at music festivals including Warped Tour, Reading and Leeds, and Soundwave.',
    concerts: [
            { date: 'October 1st, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Charlotte, NC - Spectrum Center', name: 'All Time Low: Everyone\'s Talking!' },
            { date: 'October 8th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Atlanta, GA - State Farm Arena', name: 'All Time Low: Everyone\'s Talking!' },
            { date: 'October 15th, 2026', day: 'Saturday', time: '7:00 PM', venue: 'Miami, FL - Wanda Metropolitano', name: 'All Time Low: Everyone\'s Talking!' }
        ],
    dateShort: 'Oct 1',
    dateShortUpper: 'OCT 1',
    dateFull: 'October 1, 2026',
    dateTime: '2026 · 7:00 PM',
    time: '7:00 PM',
    section: '120',
    row: 'D',
    seat: '18',
    image: 'https://files.kerrang.com/production/images/All-Time-Low-pink-header-Jimmy-Fontaine.jpg?auto=compress&fit=max&w=3840',
    bannerImage: 'https://i.pinimg.com/736x/fb/0f/02/fb0f02536749a6e7f07440f8282a5252.jpg',
    fallback: 'assets/all-time-low.svg',
    ticketCode: 'STAGEPASS · ATL-TALKING-120-D-18'
  }
};

/**
 * True only if the id is one of the events above.
 * (Guards against typos or made-up ?event=... values in the URL.)
 * @param {string|null} id
 * @returns {boolean}
 */
function isKnownEvent(id) {
  return Object.hasOwn(eventCatalog, id);
}


// 5. CHOOSING WHICH EVENT TO SHOW ---------------------------------------------
// localStorage keeps data between pages (it is how checkout "remembers" the click on Home):
//   'stagepass-selected-event'  = last event the user opened
//   'stagepass-purchased-event' = last event the user finished buying
const eventIdFromUrl = new URLSearchParams(window.location.search).get('event');
const selectedEventId = localStorage.getItem('stagepass-selected-event');
const purchasedEventId = localStorage.getItem('stagepass-purchased-event');

let currentEventId;
if (page === 'ticket') {
  // The ticket page ONLY shows something the user actually bought.
  // null means "nothing purchased yet" and triggers the empty state in section 6.
  currentEventId = isKnownEvent(purchasedEventId) ? purchasedEventId : null;
} else if (isKnownEvent(eventIdFromUrl)) {
  currentEventId = eventIdFromUrl;      // 1st choice: the event in the link that was clicked
} else if (isKnownEvent(selectedEventId)) {
  currentEventId = selectedEventId;     // 2nd choice: the last event the user opened
} else {
  currentEventId = 'tame-impala';       // 3rd choice: default so the page is never blank
}

const currentEvent = currentEventId ? eventCatalog[currentEventId] : null;


// 6. FILLING CHECKOUT / TICKET PAGES -------------------------------------------
if (page === 'ticket' && !currentEvent) {
  // Nothing purchased yet: hide the ticket and show the "No tickets yet" message instead.
  document.querySelector('#ticket-banner').hidden = true;
  document.querySelector('#ticket-viewer').hidden = true;
  document.querySelector('#ticket-empty').hidden = false;
  document.title = 'StagePass | My Ticket';
} else if ((page === 'checkout' || page === 'ticket') && currentEvent) {
  // Remember the event on checkout so reloading the page keeps the same artist.
  if (page === 'checkout') {
    localStorage.setItem('stagepass-selected-event', currentEventId);
  }

  // Each key below matches a data-event-field="..." attribute in the HTML.
  // Example: <h1 data-event-field="name"> receives currentEvent.name.
  const fieldValues = {
    name: currentEvent.name,
    tour: currentEvent.tour,
    venue: currentEvent.venue,
    dateShort: currentEvent.dateShort,
    dateShortUpper: currentEvent.dateShort.toUpperCase(),
    dateTime: currentEvent.dateTime,
    time: currentEvent.time,
    section: currentEvent.section,
    row: currentEvent.row,
    seat: currentEvent.seat,
    seatSummary: `Section ${currentEvent.section} · Row ${currentEvent.row}`,
    ticketCount: currentEvent.ticketCount,
    ticketPrice: currentEvent.ticketPrice,
    fees: currentEvent.fees,
    totalPrice: currentEvent.totalPrice,
    confirmationLabel: `${currentEvent.name} · ${currentEvent.tour}`,
    ticketEventLine: `${currentEvent.dateFull} · ${currentEvent.venue}`,
    ticketCode: currentEvent.ticketCode
  };

  // Replace the placeholder text in every matching element.
  Object.entries(fieldValues).forEach(([field, value]) => {
    document.querySelectorAll(`[data-event-field="${field}"]`).forEach((element) => {
      element.textContent = value;
    });
  });

  // Swap in this event's artwork (images are marked with data-event-image in the HTML).
  document.querySelectorAll('[data-event-image]').forEach((image) => {
    image.src = currentEvent.image;
    image.dataset.fallback = currentEvent.fallback;
    image.alt = `${currentEvent.name} concert artwork`;
  });

  document.title = `StagePass | ${page === 'checkout' ? 'Checkout' : 'Ticket'} - ${currentEvent.name}`;
}


// 7. IMAGE FALLBACKS ----------------------------------------------------------
// Live artist photos load first. If one fails (offline, broken link), the local
// SVG poster from data-fallback is used so the layout never has a blank hole.
document.querySelectorAll('img[data-fallback]').forEach((image) => {
  /** Swaps the image to its local backup (does nothing if it is already the backup). */
  function useFallback() {
    if (image.src.endsWith(image.dataset.fallback)) return;
    image.src = image.dataset.fallback;
  }

  // Case 1: the image fails to load after this script runs.
  image.addEventListener('error', useFallback);

  // Case 2: the image already failed BEFORE this script ran, so no error event will fire.
  if (image.complete && image.naturalWidth === 0) useFallback();
});


// 8. HOME PAGE: CLICKED EVENT + FILTERING ---------------------------------------
// Remember which card was clicked before checkout.html loads.
document.querySelectorAll('.event-card[href*="checkout.html"]').forEach((card) => {
  card.addEventListener('click', () => {
    const eventId = new URL(card.href, window.location.href).searchParams.get('event');
    if (isKnownEvent(eventId)) {
      localStorage.setItem('stagepass-selected-event', eventId);
    }
  });
});

// Search text and category pills work together: a card shows only if it matches BOTH.
const searchInput = document.querySelector('#event-search');
const eventCards = [...document.querySelectorAll('.event-card')];
const emptyResults = document.querySelector('#empty-results');
const categoryButtons = [...document.querySelectorAll('.category-pill')];
let selectedCategory = 'all'; // 'all' means "Featured" (no category filter)

/**
 * Shows or hides each event card based on the search box and selected category,
 * and shows the "No matching events" message when nothing is visible.
 * Runs every time the user types or taps a category pill.
 */
function filterEvents() {
  if (!eventCards.length) return; // Not on the home page.

  const query = (searchInput?.value || '').trim().toLowerCase();
  let visibleCount = 0;

  eventCards.forEach((card) => {
    const name = card.dataset.eventName.toLowerCase(); // from data-event-name in index.html
    const category = card.dataset.category;            // from data-category in index.html
    const matchesText = !query || name.includes(query);
    const matchesCategory = selectedCategory === 'all' || category === selectedCategory;
    const show = matchesText && matchesCategory;

    card.hidden = !show;
    if (show) visibleCount += 1;
  });

  if (emptyResults) emptyResults.hidden = visibleCount !== 0;
}

if (searchInput) {
  searchInput.addEventListener('input', filterEvents);
}

// Tapping a pill highlights it and re-runs the filter.
categoryButtons.forEach((button) => {
  button.addEventListener('click', () => {
    categoryButtons.forEach((item) => item.classList.remove('active'));
    button.classList.add('active');
    selectedCategory = button.dataset.category;
    filterEvents();
  });
});


// 9. CHECKOUT PAGE ------------------------------------------------------------

// --- Delivery / payment option buttons ---
// Only one button per data-choice-group ("delivery" or "payment") can be selected.
document.querySelectorAll('.choice-button').forEach((button) => {
  button.addEventListener('click', () => {
    const group = button.dataset.choiceGroup;
    document.querySelectorAll(`[data-choice-group="${group}"]`).forEach((item) => {
      item.classList.remove('selected');
    });
    button.classList.add('selected');
  });
});

// --- Hold timer ---
// Demo countdown that starts at the design's 09:32. It does not reserve real tickets.
const timerDisplay = document.querySelector('#checkout-timer');
const addMinuteButton = document.querySelector('#add-minute');
let secondsRemaining = 9 * 60 + 32;
let timerInterval;

/** Converts secondsRemaining into MM:SS text (for example 09:05) and shows it. */
function drawTimer() {
  if (!timerDisplay) return;
  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  timerDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Tick once per second, stopping at zero.
if (timerDisplay) {
  timerInterval = window.setInterval(() => {
    if (secondsRemaining > 0) {
      secondsRemaining -= 1;
      drawTimer();
    }
  }, 1000);
}

// "+1 Minute" button.
if (addMinuteButton) {
  addMinuteButton.addEventListener('click', () => {
    secondsRemaining += 60;
    drawTimer();
  });
}

// --- Card field formatting ---
// Keeps typing readable and digits-only. Nothing is sent anywhere (demo only).
const cardNumber = document.querySelector('#card-number');
if (cardNumber) {
  cardNumber.addEventListener('input', () => {
    const digits = cardNumber.value.replace(/\D/g, '').slice(0, 16);   // keep up to 16 digits
    cardNumber.value = digits.replace(/(.{4})/g, '$1 ').trim();        // group as 1234 5678 ...
  });
}

const cardExpiry = document.querySelector('#card-expiry');
if (cardExpiry) {
  cardExpiry.addEventListener('input', () => {
    const digits = cardExpiry.value.replace(/\D/g, '').slice(0, 4);    // MMYY
    cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits; // MM/YY
  });
}

const cardCvv = document.querySelector('#card-cvv');
if (cardCvv) {
  cardCvv.addEventListener('input', () => {
    cardCvv.value = cardCvv.value.replace(/\D/g, '').slice(0, 4);      // 3-4 digits
  });
}

// --- Purchase processing ---
// "Confirm Purchase" swaps the form for a progress screen (25 > 50 > 75 > 100%),
// then saves the event as purchased and shows the confirmation screen.
const checkoutShell = document.querySelector('#checkout-shell');
const processingState = document.querySelector('#processing-state');
const confirmationState = document.querySelector('#confirmation-state');
const confirmButton = document.querySelector('#confirm-purchase');
const progressBar = document.querySelector('#progress-bar');
const progressLabel = document.querySelector('#progress-label');
const formMessage = document.querySelector('#form-message');

/**
 * Updates the progress bar width and the percentage text together.
 * @param {number} percent - Progress from 0 to 100.
 */
function showProgress(percent) {
  if (progressBar) progressBar.style.width = `${percent}%`;
  if (progressLabel) progressLabel.textContent = `${percent}%`;
}

if (confirmButton) {
  confirmButton.addEventListener('click', () => {
    // Block the purchase if the hold timer ran out; "+1 Minute" lets the demo continue.
    if (secondsRemaining <= 0) {
      formMessage.textContent = 'The ticket hold expired. Add one minute to continue the demo.';
      return;
    }

    formMessage.textContent = '';
    window.clearInterval(timerInterval); // Stop the countdown once the purchase starts.

    // Hide the form and show the progress screen at 25%.
    checkoutShell.hidden = true;
    processingState.hidden = false;
    confirmationState.hidden = true;
    showProgress(25);

    // Step the bar forward every 650ms: 50%, 75%, 100%.
    [50, 75, 100].forEach((percent, index) => {
      window.setTimeout(() => {
        showProgress(percent);

        // At 100%, pause briefly, save the purchase, and show the confirmation.
        if (percent === 100) {
          window.setTimeout(() => {
            localStorage.setItem('stagepass-purchased-event', currentEventId); // ticket.html reads this
            processingState.hidden = true;
            confirmationState.hidden = false;
            confirmationState.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }, 450);
        }
      }, 650 * (index + 1));
    });
  });
}

//Concert Information Loader for Concert Info Page
if (body.dataset.page === 'concert-info') {
  localStorage.setItem('stagepass-selected-event', currentEventId);

    const artistNameEl = document.querySelector('.artist-name');
    const bioTitleEl = document.querySelector('.bio-left .title');
    const artistGenreEl = document.querySelector('.artist-genre');
    const artistBioEl = document.querySelector('.bio-left p');
    const artistImageEl = document.querySelector('.bio-right img');
    const bannerImageEl = document.querySelector('.artist-image');

    if (artistNameEl && currentEvent) artistNameEl.textContent = currentEvent.name;
    if (bioTitleEl && currentEvent) bioTitleEl.textContent = currentEvent.name;
    if (artistGenreEl && currentEvent) artistGenreEl.textContent = `Genre: ${currentEvent.genre || 'Alternative/Pop'}`;

    if(artistImageEl && currentEvent) {
        artistImageEl.src = currentEvent.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tame_Impala_2019.jpg/800px-Tame_Impala_2019.jpg';
        artistImageEl.alt = `${currentEvent.name} Image`;
    }

    if(bannerImageEl && currentEvent) {
        bannerImageEl.src = currentEvent.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tame_Impala_2019.jpg/800px-Tame_Impala_2019.jpg';
        bannerImageEl.alt = `${currentEvent.name} Banner Image`;
    }

    if(artistBioEl && currentEvent &&currentEvent.bio) {
    artistBioEl.textContent = currentEvent.bio;
  }

  const concertCardsContainer = document.querySelector('.concert-cards');
  if (concertCardsContainer && currentEvent.concerts) {
    concertCardsContainer.innerHTML = '';

    currentEvent.concerts.forEach((show, index) => {
      const concertItem = document.createElement('div');
      concertItem.className = 'concert-item';
      concertItem.innerHTML = `
        <div class="date-box" style="background: var(--badge-date-bg)">
            <span class="date">${show.date}</span>
        </div>
        <span class="day-time">
            <span class="day">${show.day}</span>
            <span class="time">${show.time}</span>
        </span>
        <h3 class="location-venue">${show.venue}</h3>
        <p class="concert-name">${show.name}</p> 
        <div class="action-button">
            <a href="selection.html?event=${currentEventId}&venueIndex=${index}" class="btn btn-primary" style="display:inline-block; text-align:center; text-decoration:none;">Get Tickets</a>
        </div>
      `;
      concertCardsContainer.appendChild(concertItem);
    });
  }
}

  // Ticket Selection Page Initialization
  if (body.dataset.page === 'selection') {
    localStorage.setItem('stagepass-selected-event', currentEventId);

    const selectionTitleEl = document.querySelector('.event-title');
    const venueEl = document.querySelector('.location-venue');
    const eventImageEL = document.querySelector('.event-image');
    const dayEl = document.querySelector('.day');
    const timeEl = document.querySelector('.time');
  
    const urlParams = new URLSearchParams(window.location.search);
    const venueIndexParam = urlParams.get('venueIndex');
    const venueIndex =  venueIndexParam !== null ? parseInt(venueIndexParam, 10) : 0; 

    const selectedConcert = (currentEvent.concerts && currentEvent.concerts[venueIndex])
      ? currentEvent.concerts[venueIndex]
      : {
        date: currentEvent.dateFull,
        day: 'Saturday',
        time: currentEvent.time,
        venue: currentEvent.venue,
        name: currentEvent.tour
      }; 
  

    if (selectionTitleEl && currentEvent) {
      selectionTitleEl.textContent = `${currentEvent.name}: ${currentEvent.tour}`;
    }

    if (venueEl) {
      venueEl.textContent = selectedConcert.venue;
    }

    if (dayEl) {
      dayEl.textContent = selectedConcert.day;
    }

    if (timeEl) {
      timeEl.textContent = selectedConcert.time;
    }

    if (eventImageEL && currentEvent) {
      eventImageEL.src = currentEvent.image || 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3e/Tame_Impala_2019.jpg/800px-Tame_Impala_2019.jpg';
      eventImageEL.alt = `${currentEvent.name} concert artwork`;
    }

    document.title = `stagepass | Ticket Selection - ${currentEvent.name}`;

  };
  



