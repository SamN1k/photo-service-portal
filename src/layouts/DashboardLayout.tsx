import { Outlet } from 'react-router-dom';

import Header from '../components/Header';
import Footer from '../components/Footer';
import Sidebar from '../components/Sidebar';

export const DashboardLayout = () => {
    return (
        <div className="app-shell flex min-h-screen flex-col">
            <Header />
            <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col lg:flex-row">
                <Sidebar />
                <main className="flex-1 p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
            <Footer />
        </div>
    );
};
