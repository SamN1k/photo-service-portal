import { Outlet } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="dashboard-shell flex min-h-screen flex-col">
            <Header />
            <div className="mx-auto flex w-full max-w-7xl flex-1">
                <Sidebar />
                <main className="relative flex-1 overflow-hidden p-6 md:p-8">
                    <div className="glass-orb glass-orb--one" />
                    <div className="glass-orb glass-orb--two" />
                    <div className="relative z-10">
                        <Outlet />
                    </div>
                </main>
            </div>
            <Footer />
        </div>
    );
};