import {
  ArrowRight,
  CheckCircle2,
  Edit3,
  Flower2,
  ShoppingBag,
  Truck,
} from "lucide-react";
import Link from "next/link";
import AccountMenu from "./_components/AccountMenu";
import CartLink from "./_components/CartLink";
import CatalogSearchForm from "./_components/CatalogSearchForm";
import { getFooterLinkProps } from "./_components/footerRoutes";

const categories = [
  {
    label: "Graduation",
    title: "The Honors Collection",
    copy: "Bright blooms to celebrate big achievements.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBfYW4rhNmfeV7D0s-WPcW0blOIZYhX5laFmGV8UG5tQTWcIN-T-P5D2ippickPbR-28h0taTc4vFtwQu6VUL_vgaKmJkLU7wkuUu21ABvQiJJIAC9riR4DammWLvtAwe4J7Fb7FVM9LcWC71jKBGKV35YVXHlEbecqoyVxaQMDXDeh4unHlXBJUDpdiSj_U4Kpnj2HBs6OTi9unRaBZhSh9TeaxIwIrhUH_XHsMkN6ySIz9iHalUg501f03v-i6-8pTpHRCmUqXog",
  },
  {
    label: "Birthday",
    title: "Birthday Blossoms",
    copy: "Vibrant colors to match their special day.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCHetPM226zjvGDo_f_7tE0TbX9wXv_2rbkW4Ej7pHGrAVCpp9rFuMuVJy7Lf78hMeFd5EutEp0jmIr6owSxBPtGoaoRO9zRDaEl2ITUNaicPklbpv8BKw_dhTxvdRBAX2SBoYrnpeAn8IDhLzzo_JQK1s678cpImMmSKHVWfNQzt1zUr_0PgxH6VfoUxifE1qIDdFpLUYFfLxQAnia650wkqAfq3UVQquUUDUK_2BnptJu3IjnLYsv5SOHALezg046y8r78rZ1chI",
  },
  {
    label: "Surprise",
    title: "Just Because",
    copy: "Unexpected joy delivered to their doorstep.",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB7Jy7J_SSofVcaoI9SVsPakZ-cywW55u1e9vb-WHRDUNYJFHp3SYFp6f0oP4awRTkBmy8ZAo7Wj6WUGVQzPZfZP-dPJzEXCfwHxBjcOrk7bt7MzE0J_nD1K9ttsFZgvMZS37r4tlvC5iNUnu_5JceuCiY2AxaS5If9bC5n6v3NE8IltRlQLXJ9KBxj06qZjQ69I5Pr80L4hyRg7yBhrA1l-2JIxZTJk0CRz9DQQwyODY3nZ8hVCbFefbLF-zK0sppWNjK3ELIh0Xw",
  },
];

const steps = [
  {
    icon: Flower2,
    title: "Pick Your Bloom",
    copy: "Browse our seasonally curated collections tailored for specific campus milestones.",
    tone: "rose",
  },
  {
    icon: Edit3,
    title: "Add a Note",
    copy: "Personalize your gift with a physical card featuring your custom, heartfelt sentiment.",
    tone: "cream",
  },
  {
    icon: Truck,
    title: "Hand Delivery",
    copy: "We deliver directly to dorms or campus offices, ensuring a perfect hand-off every time.",
    tone: "white",
  },
];

const footerGroups = [
  {
    title: "Company",
    links: ["About Us", "Gift Guides", "Shipping Info"],
  },
  {
    title: "Support",
    links: ["Privacy Policy", "Track Order", "Contact Us"],
  },
];

export default function Home() {
  return (
    <main className="site-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand-row">
          <Link className="brand" href="/">
            Bloomify
          </Link>
          <div className="nav-links">
            <Link href="/occasions">Occasions</Link>
            <Link href="/graduation">Graduation</Link>
            <Link href="/birthdays">Birthdays</Link>
            <Link href="/catalog">Best Sellers</Link>
          </div>
        </div>

        <div className="nav-actions">
          <CatalogSearchForm />
          <CartLink iconSize={19} />
          <AccountMenu iconSize={19} />
        </div>
      </nav>

      <header className="hero">
        <img
          className="hero-image"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuC-lY5d0LcOtv9WQHooA0BRdTs9PaeCGBT7SdsuAV844YQ8b6_o1pWgop-S_5ZVWQ3BtJWTw7Mz4PvRN5ZtFtViVUfPEjYA0LuR52DCU-vGDJJ5IXuSzajat2-JEn2usOF5Wk2OnjzieCVQFqz1ph3TEZgOHUTP1aLvWfIeJusPcUXn5YexNp6iHSRZQTNq86LGLcHHPbKdH1bFaPQ3sarFu_UhYLuTNRB5nGtmTgRP5a08TkzQMJKAqW1w9viD-YSrdJWSFnJxzko"
          alt="A lush bouquet of pink and cream flowers in soft morning light."
        />
        <div className="hero-wash" />
        <div className="container hero-content">
          <h1>Curate Joy for Every Campus Moment</h1>
          <p>
            Fresh, sustainably sourced botanicals delivered straight to the
            dorm. Whether it&apos;s a major milestone or a mid-term surprise, we
            bring the garden to you.
          </p>
          <div className="button-row">
            <Link className="button primary" href="/catalog">
              Shop Now
            </Link>
            <a className="button secondary" href="#gift-guide">
              View Gift Guide
            </a>
          </div>
        </div>
      </header>

      <section className="section occasions" id="occasions">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Curation</p>
              <h2>Shop by Occasion</h2>
            </div>
            <Link className="explore-link" href="/catalog">
              Explore All <ArrowRight size={18} />
            </Link>
          </div>

          <div className="category-grid">
            {categories.map((category) => (
              <article className="category-card" key={category.title}>
                <div className="category-image-wrap">
                  <img src={category.image} alt={`${category.title} bouquet`} />
                  <span>{category.label}</span>
                </div>
                <h3>{category.title}</h3>
                <p>{category.copy}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section steps-section" id="gift-guide">
        <div className="container">
          <h2 className="center-title">Simple Gifting in 3 Steps</h2>
          <div className="steps-grid">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <article className="step" key={step.title}>
                  <div className={`step-icon ${step.tone}`}>
                    <Icon size={28} />
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section gift-note" id="gift-note">
        <div className="container">
          <div className="note-panel">
            <div className="note-copy">
              <h2>More Than Just Flowers</h2>
              <p>
                Every Bloomify arrangement comes with a premium stationery
                card. Type your message online, and we&apos;ll elegantly print it
                for a truly personal touch.
              </p>
              <ul>
                <li>
                  <CheckCircle2 size={16} /> Premium heavyweight paper
                </li>
                <li>
                  <CheckCircle2 size={16} /> Multiple script font options
                </li>
                <li>
                  <CheckCircle2 size={16} /> Sealed with a floral wax-stamp look
                </li>
              </ul>
            </div>

            <div className="stationery-card" aria-label="Gift note preview">
              <div className="card-brand">Bloomify</div>
              <p>
                &quot;So proud of everything you&apos;ve accomplished this
                semester. Can&apos;t wait to see you at graduation next month!
                Love, Mom &amp; Dad&quot;
              </p>
              <span>Crafted with care</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" href="/">
              Bloomify
            </Link>
            <p>
              {"\u00a9"} 2026 Bloomify. Curating joy for campus life.
              Hand-picked, heart-delivered.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <Link {...getFooterLinkProps(link)}>{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2>Newsletter</h2>
            <p>Join our bloom club for campus deals.</p>
          </div>
        </div>
      </footer>

      <Link className="floating-shop" href="/catalog" aria-label="Shop bouquets">
        <ShoppingBag size={22} />
      </Link>
    </main>
  );
}
