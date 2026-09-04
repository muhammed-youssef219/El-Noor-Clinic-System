import "../styles/tokens.css";
import ClientProviders from "./ClientProviders";

const SITE_NAME = "عيادات النور التخصصية";
const DESCRIPTION = "عيادة متعددة التخصصات — احجز موعدك أونلاين مع نخبة من الأطباء المتخصصين، وتابع ملفك الطبي وفواتيرك من مكان واحد.";

// metadataBase is left unset until the site has a real production domain —
// set it here (new URL("https://your-domain.eg")) once deployed, so
// Open Graph/Twitter image URLs resolve to absolute links correctly.
export const metadata = {
  title: { default: SITE_NAME, template: `%s — ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: ["عيادة", "حجز موعد", "دكتور", "عيادات النور", "حجز أونلاين", "طبيب"],
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: SITE_NAME,
    description: DESCRIPTION,
    siteName: SITE_NAME,
    locale: "ar_EG",
    type: "website",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  colorScheme: "light dark",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
