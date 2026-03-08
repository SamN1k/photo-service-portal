const PhotographerDashboard = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-slate-900">Photographer Dashboard</h1>
            <div className="grid gap-4 md:grid-cols-2">
                <div className="soft-panel p-5">
                    <p className="text-sm text-slate-500">Ședințe programate</p>
                    <p className="mt-2 text-3xl font-bold">7</p>
                </div>
                <div className="soft-panel p-5">
                    <p className="text-sm text-slate-500">Review score</p>
                    <p className="mt-2 text-3xl font-bold">4.9</p>
                </div>
            </div>
        </div>
    );
};

export default PhotographerDashboard;
