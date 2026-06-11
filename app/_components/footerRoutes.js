export const gmailSupportHref =
  "https://mail.google.com/mail/?view=cm&fs=1&to=bloomify.umsu@gmail.com&su=Bloomify%20Support%20Request";

export const footerRoutes = {
  "About Us": "/about-us",
  "Gift Guides": "/#gift-guide",
  "Shipping Info": "/checkout",
  "Privacy Policy": "/privacy-policy",
  "Track Order": "/tracking",
  "Contact Us": gmailSupportHref,
  "Help Center": "/tracking",
};

export function getFooterHref(label) {
  return footerRoutes[label] || "/";
}

export function getFooterLinkProps(label) {
  const href = getFooterHref(label);
  const isExternal = href.startsWith("https://mail.google.com/");

  return isExternal
    ? { href, target: "_blank", rel: "noopener noreferrer" }
    : { href };
}
