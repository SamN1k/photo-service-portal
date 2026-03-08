const plans = [
    { name: 'Basic', price: '€199', details: 'Sesiune 1h, 20 fotografii editate', popular: false },
    { name: 'Pro', price: '€399', details: 'Sesiune 3h, 70 fotografii editate', popular: true },
    { name: 'Studio', price: '€699', details: 'Sesiune full-day, 180 fotografii editate', popular: false },
];

const Offers = () => {
    return (
        <div className="dashboard-shell min-h-screen px-6 py-12">
            <div className="mx-auto w-full max-w-7xl">
                <h1 className="text-4xl font-bold text-slate-900">Pachete foto</h1>
                <p className="mt-2 text-slate-600">Prețuri și structură de ofertă inspirate de layout-urile moderne de dashboard.</p>

                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {plans.map((plan) => (
                        <article key={plan.name} className={`soft-panel card-hover p-6 ${plan.popular ? 'ring-2 ring-blue-500' : ''}`}>
                            {plan.popular && (
                                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">Popular</span>
                            )}
                            <h3 className="mt-3 text-xl font-bold">{plan.name}</h3>
                            <p className="mt-2 text-3xl font-extrabold text-slate-900">{plan.price}</p>
                            <p className="mt-3 text-sm text-slate-600">{plan.details}</p>
                            <button className="mt-6 w-full rounded-lg bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700">
                                Alege pachetul
                            </button>
                        </article>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Offers;
