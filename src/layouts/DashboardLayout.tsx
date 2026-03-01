import { Outlet } from 'react-router-dom';
// Assume these components are built in your components/ folder
import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 p-6 bg-gray-50">
                    {/* Outlet renders the matched child route (e.g., UserDashboard) */}
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};