import {
  Flower2,
  GraduationCap,
  Truck,
} from "lucide-react";
import Link from "next/link";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";

export const metadata = {
  title: "Bloomify - Occasions",
  description:
    "Curated floral collections for graduations, birthdays, anniversaries, and everyday campus surprises.",
};

const occasionCards = [
  {
    title: "Graduation",
    copy: "Grand, sophisticated bouquets designed to honor their hard work and academic achievements in style.",
    image: "/occasions/occasion-graduation.png",
    href: "/graduation",
    featured: true,
  },
  {
    title: "Birthdays",
    copy: "Bright, joyful arrangements to make their day extra special.",
    image: "/occasions/occasion-birthdays.png",
    href: "/birthdays",
  },
  {
    title: "Gift Box",
    copy: "Beautiful curated gift boxes for birthdays, graduation, and special campus moments.",
    image: "/birthdays/confetti-gift-box.png",
    href: "/catalog?category=Gift%20Box",
  },
  {
    title: "Just Because",
    copy: "Spontaneous gestures of affection with our everyday seasonal picks.",
    image: "/occasions/occasion-just-because.png",
    href: "/catalog",
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

export default function OccasionsPage() {
  return (
    <main className="site-shell occasions-shell">
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

        <div className="nav-actions occasions-nav-actions">
          <CatalogSearchForm />
          <CartLink iconSize={19} />
          <AccountMenu iconSize={19} />
        </div>
      </nav>

      <section className="occasions-hero container">
        <h1>Celebrate Every Moment</h1>
        <p>
          From major academic milestones to a simple &quot;thinking of you,&quot;
          our carefully curated floral collections bring elegance to every
          campus occasion.
        </p>
      </section>

      <section className="container occasions-bento" aria-label="Occasion collections">
        {occasionCards.slice(0, 3).map((occasion) =>
          occasion.featured ? (
            <article className="occasion-feature-card" key={occasion.title}>
              <img src={occasion.image} alt={`${occasion.title} flowers`} />
              <div className="occasion-feature-overlay" />
              <div className="occasion-feature-content">
                <h2>{occasion.title}</h2>
                <p>{occasion.copy}</p>
                <Link href={occasion.href}>Explore Collection</Link>
              </div>
            </article>
          ) : (
            <article className="occasion-card" key={occasion.title}>
              <div className="occasion-card-image">
                <img src={occasion.image} alt={`${occasion.title} flowers`} />
              </div>
              <div className="occasion-card-body">
                <h2>{occasion.title}</h2>
                <p>{occasion.copy}</p>
                <Link href={occasion.href}>Explore Collection</Link>
              </div>
            </article>
          )
        )}

        <article className="surprise-campus-card">
          <GraduationCap size={34} aria-hidden="true" />
          <h2>Surprise Campus</h2>
          <p>
            Seamlessly delivered directly to dorms or campus buildings to
            brighten their study week.
          </p>
          <Link href="/catalog">Explore Collection</Link>
        </article>

        {occasionCards.slice(3).map((occasion) => (
          <article className="occasion-card" key={occasion.title}>
            <div className="occasion-card-image">
              <img src={occasion.image} alt={`${occasion.title} flowers`} />
            </div>
            <div className="occasion-card-body">
              <h2>{occasion.title}</h2>
              <p>{occasion.copy}</p>
              <Link href={occasion.href}>Explore Collection</Link>
            </div>
          </article>
        ))}
      </section>

      <section className="campus-life-section">
        <div className="container campus-life-grid">
          <div className="campus-life-copy">
            <h2>Designed for Campus Life</h2>
            <p>
              We understand the rhythm of university life. From dorm room
              surprises to graduation day ceremonies, our bouquets are designed
              to fit the scale and sentiment of your most important campus
              moments, delivered with care when they need it most.
            </p>
            <ul>
              <li>
                <span>
                  <Flower2 size={20} />
                </span>
                <div>
                  <h3>Premium Curation</h3>
                  <p>
                    Only the freshest, highest-quality blooms selected for
                    longevity and aesthetic appeal.
                  </p>
                </div>
              </li>
              <li>
                <span>
                  <Truck size={20} />
                </span>
                <div>
                  <h3>Seamless Delivery</h3>
                  <p>
                    Navigating campus mailrooms and dorm desks so your gift
                    arrives flawlessly.
                  </p>
                </div>
              </li>
            </ul>
          </div>

          <div className="campus-life-image">
            <img
              src="/occasions/campus-bouquet-books.png"
              alt="Rose bouquet resting on books beside a window"
            />
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
    </main>
  );
}
