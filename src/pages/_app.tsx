import 'bootstrap/dist/css/bootstrap.min.css';
import '../styles/globals.css';
import type { AppProps } from 'next/app';
import { AuthProvider } from '../context/AuthContext';
import WelcomeModal from '@/components/WelcomeModal';

export default function MyApp({Component,pageProps}:AppProps) {
  return (
    <AuthProvider>
      <WelcomeModal />
      <Component {...pageProps}/>
    </AuthProvider>
  );
}