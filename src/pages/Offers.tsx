import { Link } from 'react-router-dom';
import { PATHS } from '../routes/paths';

const Landing = () => {
    return (
        <div className="bg-white">
            <section className="relative py-20 px-6 text-center bg-linear-to-r from-blue-600 to-indigo-700 text-white">
                <div className="max-w-4xl mx-auto">
                    <h1 className="text-5xl font-extrabold mb-6">Capture Every Moment</h1>
                    <p className="text-xl mb-10 opacity-90">
                        Connecting world-class photographers with people who want to preserve their most precious memories.
                    </p>
                    <div className="flex justify-center gap-4">
                        <Link to={PATHS.SIGN_UP} className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition">
                            Get Started
                        </Link>
                        <Link to={PATHS.OFFERS} className="border-2 border-white px-8 py-3 rounded-lg font-bold hover:bg-white hover:text-blue-600 transition">
                            View Offers
                        </Link>
                    </div>
                </div>
            </section>

            <section className="py-16 px-6 max-w-7xl mx-auto grid md:grid-cols-3 gap-8">
                <div className="p-6 border border-gray-100 rounded-xl shadow-sm text-center">
                    <div className="text-3xl mb-4">📸</div>
                    <h3 className="font-bold text-xl mb-2">Top Photographers</h3>
                    <p className="text-gray-600">Vetted professionals for every occasion.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl shadow-sm text-center">
                    <div className="text-3xl mb-4">💰</div>
                    <h3 className="font-bold text-xl mb-2">Best Prices</h3>
                    <p className="text-gray-600">Competitive packages tailored to your budget.</p>
                </div>
                <div className="p-6 border border-gray-100 rounded-xl shadow-sm text-center">
                    <div className="text-3xl mb-4">⚡</div>
                    <h3 className="font-bold text-xl mb-2">Fast Delivery</h3>
                    <p className="text-gray-600">Receive your edited photos within 48 hours.</p>
                </div>
            </section>
        </div>
    );
};

export default Landing;