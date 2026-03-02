const AdminPanel = () => {
    const stats = [
        { label: 'Total Users', value: '1,240', color: 'text-blue-600' },
        { label: 'Photographers', value: '85', color: 'text-purple-600' },
        { label: 'Revenue', value: '$45,000', color: 'text-green-600' },
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">System Administration</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {stats.map((s) => (
                    <div key={s.label} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500 text-sm mb-1">{s.label}</p>
                        <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50 font-bold">Recent Registrations</div>
                <div className="p-4 text-gray-500 italic">No recent registrations to display.</div>
            </div>
        </div>
    );
};

export default AdminPanel;