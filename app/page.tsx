import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirigir al dashboard o login según el estado de autenticación
  // Esto será manejado por el middleware
  redirect('/dashboard');
}
