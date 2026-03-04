export const metadata = {
  title: "Campaign Builder | Marketo",
  description: "Conversational campaign builder for Marketo",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
