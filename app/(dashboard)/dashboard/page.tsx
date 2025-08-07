import { DashboardStats } from '@/components/DashboardStats';
// import { TokenTestComponent } from '@/components/dev/TokenTestComponent';

export default function DashboardPage() {
  return (
    <>
      <DashboardStats />
      {/* {process.env.NODE_ENV === 'development' && <TokenTestComponent />} */}
    </>
  );
}
