// ============================================================
// 🎯 TEMPLATE CONFIGURATION — FILL IN ALL {{PLACEHOLDERS}}
// This is your single source of truth for all site settings.
// ============================================================

export const templateConfig = {

  // ─────────────────────────────────────────────────────────
  // BUSINESS INFO
  // ─────────────────────────────────────────────────────────
  business: {
    name:       '{{BUSINESS_NAME}}',        // e.g. "Power of One Training"
    tagline:    '{{TAGLINE}}',              // e.g. "Transform Your Body, Transform Your Life"
    ownerName:  '{{OWNER_NAME}}',           // e.g. "Ramin Razy"
    ownerTitle: '{{OWNER_TITLE}}',          // e.g. "Certified Personal Trainer"

    phone:      '{{PHONE}}',               // e.g. "+66 81 234 5678"
    email:      '{{EMAIL}}',               // e.g. "ramin@powerofonetraining.com"
    whatsapp:   '{{WHATSAPP_NUMBER}}',     // e.g. "66812345678" (no + or spaces)
    whatsappMsg:'{{WHATSAPP_MESSAGE}}',    // e.g. "Hi Ramin! I'm interested in personal training."

    address: {
      street:   '{{STREET}}',             // e.g. "123 Sukhumvit Rd"
      district: '{{DISTRICT}}',           // e.g. "Khlong Toei"
      city:     '{{CITY}}',               // e.g. "Bangkok"
      province: '{{PROVINCE}}',           // e.g. "Bangkok"
      country:  '{{COUNTRY}}',            // e.g. "Thailand"
      zip:      '{{ZIP}}',                // e.g. "10110"
      mapUrl:   '{{GOOGLE_MAPS_URL}}',    // Full Google Maps embed URL
    },

    // Social media profiles
    social: {
      instagram: '{{INSTAGRAM_URL}}',     // e.g. "https://instagram.com/powerofonetraining"
      facebook:  '{{FACEBOOK_URL}}',
      youtube:   '{{YOUTUBE_URL}}',
      line:      '{{LINE_ID}}',           // LINE ID for Thailand
      tiktok:    '{{TIKTOK_URL}}',
    },

    // Business hours (for schema markup & contact page)
    hours: {
      weekdays: '{{WEEKDAY_HOURS}}',      // e.g. "6:00 AM – 9:00 PM"
      saturday: '{{SATURDAY_HOURS}}',     // e.g. "7:00 AM – 6:00 PM"
      sunday:   '{{SUNDAY_HOURS}}',       // e.g. "Closed"
    },
  },

  // ─────────────────────────────────────────────────────────
  // DESIGN SYSTEM
  // ─────────────────────────────────────────────────────────
  design: {
    colors: {
      primary:   '{{PRIMARY_COLOR}}',     // e.g. "#FF6B35"  (orange)
      secondary: '{{SECONDARY_COLOR}}',   // e.g. "#00E5FF"  (cyan)
      accent:    '{{ACCENT_COLOR}}',      // e.g. "#FFD700"  (optional)

      // Auto-generated shades — or override manually
      primaryLight: '{{PRIMARY_LIGHT}}',  // e.g. "#FF8A5B"
      primaryDark:  '{{PRIMARY_DARK}}',   // e.g. "#E55A2B"

      bgPrimary:    '{{BG_PRIMARY}}',     // e.g. "#121212"
      bgSecondary:  '{{BG_SECONDARY}}',   // e.g. "#1A1A1A"
      textPrimary:  '{{TEXT_PRIMARY}}',   // e.g. "#FFFFFF"
      textSecondary:'{{TEXT_SECONDARY}}', // e.g. "#CCCCCC"
    },

    fonts: {
      heading: '{{FONT_HEADING}}',        // e.g. "Reddit Sans"
      body:    '{{FONT_BODY}}',           // e.g. "Inter"
    },

    // Active color scheme preset
    // Options: "fitness" | "wellness" | "lifestyle" | "luxury" | "performance"
    scheme: 'fitness',

    // Active theme
    // Options: "dark" | "light" | "highcontrast"
    defaultTheme: 'dark',
  },

  // ─────────────────────────────────────────────────────────
  // FEATURE TOGGLES
  // ─────────────────────────────────────────────────────────
  features: {
    blog:          true,   // Show blog section and pages
    testimonials:  true,   // Show testimonials section
    videoSection:  false,  // Show video/media section
    faq:           true,   // Show FAQ section
    pwa:           true,   // Enable Progressive Web App
    whatsapp:      true,   // WhatsApp floating widget
    darkModeToggle:true,   // Show dark/light toggle
    multiLanguage: false,  // Enable i18n
    newsletter:    false,  // Newsletter signup
    booking:       false,  // Booking calendar integration
    pricing:       true,   // Show pricing on service cards
    stats:         true,   // Show stats in about section
  },

  // ─────────────────────────────────────────────────────────
  // SEO
  // ─────────────────────────────────────────────────────────
  seo: {
    siteUrl:      '{{SITE_URL}}',         // e.g. "https://powerofonetraining.com"
    siteName:     '{{SITE_NAME}}',        // e.g. "Power of One Training"
    defaultTitle: '{{DEFAULT_TITLE}}',    // e.g. "Personal Trainer Bangkok | Power of One Training"
    titleSuffix:  '{{TITLE_SUFFIX}}',     // e.g. " | Power of One Training"
    description:  '{{META_DESCRIPTION}}', // 150-160 chars
    keywords:     '{{KEYWORDS}}',         // comma-separated
    ogImage:      '/images/og-image.jpg', // 1200×630px

    // Local SEO
    locale:       '{{LOCALE}}',           // e.g. "en_TH"
    language:     '{{LANGUAGE}}',         // e.g. "en"
    region:       '{{REGION}}',           // e.g. "TH"

    // Schema markup
    schema: {
      type:       'LocalBusiness',
      category:   '{{BUSINESS_CATEGORY}}',// e.g. "HealthClub"
      priceRange: '{{PRICE_RANGE}}',      // e.g. "$$"
    },
  },

  // ─────────────────────────────────────────────────────────
  // NAVIGATION
  // ─────────────────────────────────────────────────────────
  nav: {
    links: [
      { label: 'Home',         href: '/' },
      { label: 'About',        href: '/#about' },
      { label: 'Services',     href: '/#services' },
      { label: 'Testimonials', href: '/#testimonials' },
      { label: 'Blog',         href: '/blog' },
      { label: 'Contact',      href: '/#contact' },
    ],
    ctaLabel: '{{NAV_CTA_LABEL}}',        // e.g. "Book Free Consult"
    ctaHref:  '{{NAV_CTA_HREF}}',         // e.g. "/#contact"
    mobileMode: 'drawer',                 // "drawer" | "bottom-bar" | "hybrid"
  },

} as const;

export type TemplateConfig = typeof templateConfig;
export default templateConfig;
