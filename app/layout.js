import "./globals.css";

export const metadata = {
  title: "Bloomify | Curating Joy for Campus Life",
  description:
    "Fresh campus flower gifting with curated bouquets, handwritten-style notes, and hand delivery.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
