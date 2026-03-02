const UserDashboard = () => {
    return (
        <div>
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Welcome back, Traveler!</h1>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">My Bookings</h3>
                    <p className="text-gray-500">You have no active bookings at the moment.</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold mb-4">Notifications</h3>
                    <ul className="space-y-3">
                        <li className="text-sm text-gray-600">✔ Photographer "LensMaster" accepted your request.</li>
                        <li className="text-sm text-gray-600">✔ Your payment for "Portrait Session" was successful.</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;