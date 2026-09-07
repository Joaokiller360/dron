import DashboardClient from './DashboardClient';

export async function generateMetadata() {
  return {
    title: 'Dashboard | JB.SKYLENS',
    robots: { index: false, follow: false },
  };
}

export default function Page() {
  return <DashboardClient />;
}
