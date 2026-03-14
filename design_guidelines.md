{
  "brand": {
    "name": "Takas-style Electronics Store (Sri Lanka)",
    "attributes": [
      "trustworthy",
      "fast",
      "value-forward",
      "professional retail",
      "promotion-led (deals-first)",
      "mobile-first"
    ],
    "north_star": "Make browsing and buying electronics feel as quick and dependable as an in-store counter: strong search, clear promos, clean specs, and frictionless checkout (Stripe + COD)."
  },
  "visual_personality": {
    "style_fusion": {
      "layout_principle": "Retail e-commerce (Amazon-like information density) + Bento/tiles for promos",
      "surface_style": "Clean, bright cards on soft neutral canvas; subtle depth via borders + small shadows",
      "accent_language": "Ocean-teal + safety-blue accents (no purple); promo badges use coral/amber",
      "motion": "snappy micro-interactions, small lift + shadow on hover, subtle entrance animations"
    },
    "do_not": [
      "Do not center the entire app container.",
      "Do not use dark/saturated gradients (purple/pink etc).",
      "Do not use gradients over text-heavy areas.",
      "Avoid overly dark default UI; electronics retail should feel bright + trustworthy.",
      "Avoid visual clutter: keep promos strong but controlled."
    ]
  },
  "typography": {
    "google_fonts": {
      "primary": {
        "family": "Space Grotesk",
        "weights": [400, 500, 600, 700],
        "use": "Headings, nav labels, product titles"
      },
      "secondary": {
        "family": "Inter",
        "weights": [400, 500, 600, 700],
        "use": "Body, forms, tables, admin"
      }
    },
    "tailwind_mapping": {
      "h1": "text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight",
      "h2": "text-base md:text-lg font-medium text-muted-foreground",
      "section_title": "text-xl sm:text-2xl font-semibold tracking-tight",
      "product_title": "text-sm sm:text-base font-medium leading-snug",
      "price": "text-lg font-semibold tabular-nums",
      "small": "text-xs text-muted-foreground"
    },
    "copy_rules": [
      "Prefer short, scannable phrases: ‘Free Delivery in Colombo’, ‘Genuine Warranty’, ‘Pay with COD’.",
      "Use tabular numbers for prices and totals.",
      "Never use all-caps for long strings; only for small badges (e.g., DEAL, NEW)."
    ]
  },
  "color_system": {
    "theme": "light-first (default), optional dark mode for admin only",
    "palette_notes": "Inspired by local retail trust cues: clean whites + cool neutrals; accents are teal/blue; promo colors are coral/amber. Gradients only as decorative section wash (<=20% viewport).",
    "css_tokens": {
      "add_to_/app/frontend/src/index.css_:root": {
        "--background": "210 40% 98%",
        "--foreground": "222 47% 11%",
        "--card": "0 0% 100%",
        "--card-foreground": "222 47% 11%",
        "--popover": "0 0% 100%",
        "--popover-foreground": "222 47% 11%",
        "--primary": "199 89% 38%",
        "--primary-foreground": "210 40% 98%",
        "--secondary": "210 30% 94%",
        "--secondary-foreground": "222 47% 11%",
        "--muted": "210 30% 94%",
        "--muted-foreground": "215 16% 47%",
        "--accent": "173 58% 39%",
        "--accent-foreground": "210 40% 98%",
        "--destructive": "0 84% 58%",
        "--destructive-foreground": "210 40% 98%",
        "--border": "214 25% 88%",
        "--input": "214 25% 88%",
        "--ring": "199 89% 38%",
        "--radius": "0.75rem",
        "--brand-deal": "12 88% 55%",
        "--brand-deal-foreground": "210 40% 98%",
        "--brand-warn": "35 92% 55%",
        "--brand-warn-foreground": "222 47% 11%",
        "--brand-success": "152 60% 34%",
        "--brand-success-foreground": "210 40% 98%"
      }
    },
    "gradients": {
      "allowed_usage": [
        "Hero background wash only (decorative).",
        "Deal strip background only (not behind paragraphs).",
        "Large banners only."
      ],
      "recipes_tailwind": {
        "hero_wash": "bg-[radial-gradient(1200px_circle_at_20%_0%,hsl(var(--primary)/0.18),transparent_55%),radial-gradient(900px_circle_at_90%_10%,hsl(var(--accent)/0.14),transparent_60%)]",
        "deal_strip": "bg-[linear-gradient(90deg,hsl(var(--brand-deal)/0.14),transparent_60%)]"
      }
    }
  },
  "spacing_grid": {
    "container": "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    "section_padding": "py-8 sm:py-10 lg:py-12",
    "grid_rules": [
      "Homepage: 12-col mental model; implement with Tailwind grids.",
      "Product listing: 2 cols mobile, 3 cols md, 4 cols lg.",
      "Admin: left sidebar (collapsed on mobile via Sheet), main content with Cards + Table."
    ]
  },
  "components": {
    "component_path": {
      "shadcn_ui": [
        "/app/frontend/src/components/ui/button.jsx",
        "/app/frontend/src/components/ui/badge.jsx",
        "/app/frontend/src/components/ui/card.jsx",
        "/app/frontend/src/components/ui/input.jsx",
        "/app/frontend/src/components/ui/select.jsx",
        "/app/frontend/src/components/ui/slider.jsx",
        "/app/frontend/src/components/ui/checkbox.jsx",
        "/app/frontend/src/components/ui/radio-group.jsx",
        "/app/frontend/src/components/ui/tabs.jsx",
        "/app/frontend/src/components/ui/pagination.jsx",
        "/app/frontend/src/components/ui/navigation-menu.jsx",
        "/app/frontend/src/components/ui/breadcrumb.jsx",
        "/app/frontend/src/components/ui/carousel.jsx",
        "/app/frontend/src/components/ui/accordion.jsx",
        "/app/frontend/src/components/ui/sheet.jsx",
        "/app/frontend/src/components/ui/dialog.jsx",
        "/app/frontend/src/components/ui/tooltip.jsx",
        "/app/frontend/src/components/ui/scroll-area.jsx",
        "/app/frontend/src/components/ui/table.jsx",
        "/app/frontend/src/components/ui/progress.jsx",
        "/app/frontend/src/components/ui/sonner.jsx"
      ]
    },
    "custom_components_to_create_(.js)": [
      {
        "name": "HeaderBar",
        "purpose": "Sticky header with logo, category mega menu trigger, search, account, cart",
        "key_ui": ["NavigationMenu", "Input", "Button", "Sheet"],
        "data_testids": [
          "header-search-input",
          "header-search-submit-button",
          "header-cart-button",
          "header-account-button",
          "header-mobile-menu-button"
        ]
      },
      {
        "name": "DealMarquee",
        "purpose": "Thin promo strip for delivery/warranty/COD + rotating deal text",
        "key_ui": ["Badge"],
        "data_testids": ["deal-marquee"]
      },
      {
        "name": "CategoryTiles",
        "purpose": "Icon/image tiles for top categories",
        "key_ui": ["Card"],
        "data_testids": ["category-tiles"]
      },
      {
        "name": "ProductCard",
        "purpose": "Reusable product tile with quick actions",
        "key_ui": ["Card", "Badge", "Button", "Tooltip"],
        "data_testids": [
          "product-card",
          "product-card-add-to-cart-button",
          "product-card-wishlist-button"
        ]
      },
      {
        "name": "ProductGallery",
        "purpose": "PDP gallery with thumbnails + zoom",
        "key_ui": ["AspectRatio", "Carousel"],
        "data_testids": ["product-gallery"]
      },
      {
        "name": "FilterRail",
        "purpose": "Desktop left rail + mobile Sheet filters",
        "key_ui": ["Sheet", "Accordion", "Checkbox", "Slider", "Select"],
        "data_testids": [
          "plp-filter-open-button",
          "plp-filter-apply-button",
          "plp-filter-clear-button"
        ]
      },
      {
        "name": "CartSummary",
        "purpose": "Order summary card (subtotal, shipping, total) reused in cart/checkout",
        "key_ui": ["Card", "Separator", "Button"],
        "data_testids": ["cart-summary"]
      },
      {
        "name": "CheckoutPaymentSelector",
        "purpose": "Stripe vs COD radio selection with inline hints",
        "key_ui": ["RadioGroup", "Card", "Badge"],
        "data_testids": [
          "checkout-payment-method-radio",
          "checkout-payment-stripe-option",
          "checkout-payment-cod-option"
        ]
      },
      {
        "name": "OrderStatusStepper",
        "purpose": "Tracking stepper: Placed → Confirmed → Packed → Shipped → Delivered",
        "key_ui": ["Progress", "Badge"],
        "data_testids": ["order-status-stepper"]
      }
    ]
  },
  "page_layouts": {
    "home": {
      "structure": [
        "Sticky HeaderBar",
        "DealMarquee (thin)",
        "Hero: promo banner + 2 side promo cards (bento)",
        "CategoryTiles grid",
        "Flash Deals carousel (time boxed)",
        "Featured Products grid",
        "Brand strip / trust badges (warranty, COD, secure payments)",
        "Footer"
      ],
      "hero_layout_tailwind": "grid gap-4 lg:gap-6 lg:grid-cols-12",
      "hero_primary": "lg:col-span-8",
      "hero_side": "lg:col-span-4 grid gap-4"
    },
    "plp_product_listing": {
      "structure": [
        "Breadcrumb",
        "Title + result count + sort Select",
        "Responsive layout: filter rail (desktop) / filter Sheet (mobile)",
        "Product grid + Pagination"
      ],
      "layout_tailwind": "grid gap-6 lg:grid-cols-[280px_1fr]"
    },
    "pdp_product_detail": {
      "structure": [
        "Breadcrumb",
        "Two-column: ProductGallery + Purchase panel",
        "Specs tabs (Overview / Specs / Warranty / Reviews)",
        "Related products carousel"
      ],
      "layout_tailwind": "grid gap-8 lg:grid-cols-12",
      "gallery": "lg:col-span-7",
      "panel": "lg:col-span-5"
    },
    "cart": {
      "structure": [
        "Item list with quantity stepper",
        "CartSummary card",
        "Cross-sell: ‘Often bought together’ carousel"
      ],
      "layout_tailwind": "grid gap-8 lg:grid-cols-12",
      "items": "lg:col-span-8",
      "summary": "lg:col-span-4"
    },
    "checkout": {
      "structure": [
        "Shipping form",
        "CheckoutPaymentSelector (Stripe/COD)",
        "Order review + place order",
        "CartSummary sticky on desktop"
      ],
      "layout_tailwind": "grid gap-8 lg:grid-cols-12"
    },
    "order_tracking": {
      "structure": [
        "Order number input",
        "Status card with OrderStatusStepper",
        "Delivery address + items table"
      ]
    },
    "admin_dashboard": {
      "structure": [
        "Sidebar navigation (Sheet on mobile)",
        "KPI cards (Revenue, Orders, AOV, Low stock)",
        "Charts (Recharts) + tables"
      ]
    }
  },
  "component_specs": {
    "buttons": {
      "shape": "Professional / Corporate: radius 10-12px (token --radius set to 0.75rem)",
      "variants": {
        "primary": "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring",
        "secondary": "bg-secondary text-secondary-foreground hover:bg-secondary/70",
        "ghost": "hover:bg-accent/10"
      },
      "micro_interactions": [
        "Hover: translate-y-[-1px] shadow-sm (only on devices with hover).",
        "Active: scale-[0.98].",
        "Focus: visible ring using --ring token.",
        "No transition:all; use transition-colors and shadow only."
      ]
    },
    "product_card": {
      "rules": [
        "Image area ratio 4:3 using AspectRatio.",
        "Title 2 lines max (line-clamp-2).",
        "Price row: current price + optional struck MRP.",
        "Badges: DEAL / NEW / FAST DELIVERY.",
        "Quick add-to-cart button always visible on mobile; on desktop can appear on hover."
      ],
      "tailwind": "group rounded-xl border bg-card p-3 shadow-sm hover:shadow-md transition-shadow"
    },
    "filters": {
      "rules": [
        "Mobile: filter opens in Sheet from bottom/right.",
        "Desktop: left rail with Accordion sections.",
        "Keep sticky sort row under header on mobile."
      ]
    },
    "forms": {
      "rules": [
        "Use shadcn Form + Input + Label.",
        "Inline validation under field (text-xs text-destructive).",
        "COD option shows a small hint badge: ‘Pay when delivered’."
      ]
    },
    "tables_admin": {
      "rules": [
        "Use Table + sticky header for long lists.",
        "Row actions in DropdownMenu.",
        "Bulk select with Checkbox."
      ]
    }
  },
  "motion": {
    "library": {
      "recommended": "framer-motion",
      "install": "npm i framer-motion"
    },
    "principles": [
      "Entrance: fade + small y translate (6-10px) on section load.",
      "Hover: cards lift 1px and increase shadow.",
      "Promo carousel: auto-advance but pause on hover.",
      "Reduce motion: respect prefers-reduced-motion."
    ],
    "js_scaffold_example": {
      "fade_up": "initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: 'easeOut' }}"
    }
  },
  "data_visualization_admin": {
    "library": {
      "recommended": "recharts",
      "install": "npm i recharts"
    },
    "charts": [
      "Revenue over time (AreaChart)",
      "Orders by status (BarChart)",
      "Top categories (Donut/Pie)"
    ],
    "empty_states": [
      "Use Skeleton for loading KPI cards.",
      "Use Card with muted text and a CTA button to add first product."
    ]
  },
  "accessibility": {
    "rules": [
      "All interactive elements must have visible focus styles (ring).",
      "Use minimum 44px touch targets for primary actions.",
      "Ensure price and CTA contrast on cards (avoid light gray text on white).",
      "Use aria-label on icon-only buttons.",
      "Respect prefers-reduced-motion (disable auto-animated marquees/carousels)."
    ]
  },
  "testing_attributes": {
    "requirements": [
      "All interactive and key informational elements MUST include data-testid.",
      "Use kebab-case and role-based naming (not appearance-based).",
      "Examples: add-to-cart-button, checkout-place-order-button, order-tracking-status-text"
    ],
    "high_priority_testids_by_flow": {
      "search": [
        "header-search-input",
        "search-suggestion-item",
        "search-results-count-text"
      ],
      "cart": [
        "cart-line-quantity-increase-button",
        "cart-line-quantity-decrease-button",
        "cart-line-remove-button",
        "cart-subtotal-amount-text",
        "cart-checkout-button"
      ],
      "checkout": [
        "checkout-shipping-form",
        "checkout-payment-cod-option",
        "checkout-payment-stripe-option",
        "checkout-place-order-button",
        "checkout-order-total-amount-text"
      ],
      "tracking": [
        "order-tracking-input",
        "order-tracking-submit-button",
        "order-tracking-status-text"
      ],
      "admin": [
        "admin-products-add-button",
        "admin-products-table",
        "admin-orders-table",
        "admin-inventory-low-stock-card"
      ]
    }
  },
  "image_urls": {
    "homepage_hero_banner": [
      {
        "url": "https://images.unsplash.com/photo-1647967074298-134218c43f98?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA1OTV8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHByb2R1Y3QlMjBoZXJvJTIwYmFubmVyfGVufDB8fHx0ZWFsfDE3NzM1MTU5Nzd8MA&ixlib=rb-4.1.0&q=85",
        "description": "Fallback abstract banner; replace with promo creative generated in-app later",
        "category": "hero"
      }
    ],
    "product_placeholder_photos": [
      {
        "url": "https://images.unsplash.com/photo-1614860243518-c12eb2fdf66c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwzfHxwcmVtaXVtJTIwZWxlY3Ryb25pY3MlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBoZWFkcGhvbmVzfGVufDB8fHxibHVlfDE3NzM1MTU5Nzl8MA&ixlib=rb-4.1.0&q=85",
        "description": "Headphones product card placeholder",
        "category": "product"
      },
      {
        "url": "https://images.unsplash.com/photo-1600086827875-a63b01f1335c?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2ODl8MHwxfHNlYXJjaHwyfHxwcmVtaXVtJTIwZWxlY3Ryb25pY3MlMjBwcm9kdWN0JTIwcGhvdG9ncmFwaHklMjBoZWFkcGhvbmVzfGVufDB8fHxibHVlfDE3NzM1MTU5Nzl8MA&ixlib=rb-4.1.0&q=85",
        "description": "Alternate headphones placeholder",
        "category": "product"
      }
    ],
    "brand_story_background_optional": [
      {
        "url": "https://images.unsplash.com/photo-1770488141886-5ca6b6f54272?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NjA2MTJ8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBlbGVjdHJvbmljcyUyMHN0b3JlJTIwaW50ZXJpb3J8ZW58MHx8fHwxNzczNTE1OTg1fDA&ixlib=rb-4.1.0&q=85",
        "description": "Retail interior background for trust section (use with strong overlay; optional)",
        "category": "background"
      }
    ]
  },
  "instructions_to_main_agent": [
    "Replace CRA default App.css styles; do not keep App-header centered black page. Keep layout left-aligned and content-driven.",
    "Update index.css tokens (:root) to the provided teal/blue retail palette and radius 0.75rem.",
    "Implement pages using shadcn/ui primitives listed under component_path; create custom components as .js (not .tsx).",
    "Build a sticky HeaderBar: logo left, category menu + search center, account + cart right; on mobile move categories into a Sheet and keep search prominent.",
    "Homepage hero should be a bento: large promo banner + 2 small promo cards; use mild gradient wash only behind hero section (<=20% viewport).",
    "PLP: left FilterRail on desktop, filter Sheet on mobile; include sort Select and result count.",
    "PDP: ProductGallery + purchase panel; show COD + warranty + delivery badges near price; specs in Tabs.",
    "Cart/Checkout: reuse CartSummary; checkout includes payment selector (Stripe + COD) with clear explanation and trust microcopy.",
    "Admin: use Table + cards; add Recharts for analytics blocks.",
    "Every interactive and key informational element must have data-testid in kebab-case (see lists).",
    "Motion: use framer-motion for entrances and card hovers; respect prefers-reduced-motion. Avoid transition:all; use transition-colors / transition-shadow."
  ],
  "appendix_general_ui_ux_design_guidelines": "<General UI UX Design Guidelines>  \n    - You must **not** apply universal transition. Eg: `transition: all`. This results in breaking transforms. Always add transitions for specific interactive elements like button, input excluding transforms\n    - You must **not** center align the app container, ie do not add `.App { text-align: center; }` in the css file. This disrupts the human natural reading flow of text\n   - NEVER: use AI assistant Emoji characters like`🤖🧠💭💡🔮🎯📚🎭🎬🎪🎉🎊🎁🎀🎂🍰🎈🎨🎰💰💵💳🏦💎🪙💸🤑📊📈📉💹🔢🏆🥇 etc for icons. Always use **FontAwesome cdn** or **lucid-react** library already installed in the package.json\n\n **GRADIENT RESTRICTION RULE**\nNEVER use dark/saturated gradient combos (e.g., purple/pink) on any UI element.  Prohibited gradients: blue-500 to purple 600, purple 500 to pink-500, green-500 to blue-500, red to pink etc\nNEVER use dark gradients for logo, testimonial, footer etc\nNEVER let gradients cover more than 20% of the viewport.\nNEVER apply gradients to text-heavy content or reading areas.\nNEVER use gradients on small UI elements (<100px width).\nNEVER stack multiple gradient layers in the same viewport.\n\n**ENFORCEMENT RULE:**\n    • Id gradient area exceeds 20% of viewport OR affects readability, **THEN** use solid colors\n\n**How and where to use:**\n   • Section backgrounds (not content backgrounds)\n   • Hero section header content. Eg: dark to light to dark color\n   • Decorative overlays and accent elements only\n   • Hero section with 2-3 mild color\n   • Gradients creation can be done for any angle say horizontal, vertical or diagonal\n\n- For AI chat, voice application, **do not use purple color. Use color like light green, ocean blue, peach orange etc**\n\n</Font Guidelines>\n\n- Every interaction needs micro-animations - hover states, transitions, parallax effects, and entrance animations. Static = dead. \n   \n- Use 2-3x more spacing than feels comfortable. Cramped designs look cheap.\n\n- Subtle grain textures, noise overlays, custom cursors, selection states, and loading animations: separates good from extraordinary.\n   \n- Before generating UI, infer the visual style from the problem statement (palette, contrast, mood, motion) and immediately instantiate it by setting global design tokens (primary, secondary/accent, background, foreground, ring, state colors), rather than relying on any library defaults. Don't make the background dark as a default step, always understand problem first and define colors accordingly\n    Eg: - if it implies playful/energetic, choose a colorful scheme\n           - if it implies monochrome/minimal, choose a black–white/neutral scheme\n\n**Component Reuse:**\n\t- Prioritize using pre-existing components from src/components/ui when applicable\n\t- Create new components that match the style and conventions of existing components when needed\n\t- Examine existing components to understand the project's component patterns before creating new ones\n\n**IMPORTANT**: Do not use HTML based component like dropdown, calendar, toast etc. You **MUST** always use `/app/frontend/src/components/ui/ ` only as a primary components as these are modern and stylish component\n\n**Best Practices:**\n\t- Use Shadcn/UI as the primary component library for consistency and accessibility\n\t- Import path: ./components/[component-name]\n\n**Export Conventions:**\n\t- Components MUST use named exports (export const ComponentName = ...)\n\t- Pages MUST use default exports (export default function PageName() {...})\n\n**Toasts:**\n  - Use `sonner` for toasts\"\n  - Sonner component are located in `/app/src/components/ui/sonner.tsx`\n\nUse 2–4 color gradients, subtle textures/noise overlays, or CSS-based noise to avoid flat visuals.\n</General UI UX Design Guidelines>"
}
