import '../styles/admin.css';
import { LanguageProvider } from '../context/LanguageContext';
import { AdminProvider } from '../context/AdminContext';

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <AdminProvider>
        <Component {...pageProps} />
      </AdminProvider>
    </LanguageProvider>
  );
}