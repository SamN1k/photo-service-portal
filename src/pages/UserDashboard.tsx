const UserDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">User Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Rezervări active</p>
                    <p className="mt-2 text-3xl font-bold">3</p>
                </div>
                <div className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Cereri trimise</p>
                    <p className="mt-2 text-3xl font-bold">12</p>
                </div>
                <div className="soft-panel card-hover p-5">
                    <p className="text-sm text-slate-500">Buget mediu</p>
                    <p className="mt-2 text-3xl font-bold">€320</p>
                </div>
            </div>

            <div className="soft-panel p-5">
                <h3 className="text-lg font-bold">Notificări recente</h3>
                <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    <li>✅ Photographer "LensMaster" a confirmat sesiunea de weekend.</li>
                    <li>✅ Portofoliul nou pentru evenimente corporate este disponibil.</li>
                </ul>
            </div>
        </div>
    );
};

export default UserDashboard;
