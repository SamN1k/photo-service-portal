import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import { PATHS } from '../routes/paths';

const featureCards = [
    {
        title: 'Fotografi profesionisti',
        text: 'Colaboram cu persoane pasionate de fotografie, care stiu sa surprinda emotia si frumusetea fiecarui moment.',
    },
    {
        title: 'Servicii pentru orice eveniment',
        text: 'Platforma este potrivita pentru nunti, botezuri, aniversari, sesiuni foto, petreceri private si evenimente corporate.',
    },
    {
        title: 'Proces simplu de rezervare',
        text: 'Alegi pachetul dorit, trimiti solicitarea si urmaresti statusul rezervarii direct din contul tau.',
    },
    {
        title: 'Amintiri de calitate',
        text: 'Fiecare fotografie si material video este realizat cu grija, pentru ca evenimentul tau sa ramana viu in timp.',
    },
];

const eventImages = [
    {
        src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=900&q=80',
        alt: 'Fotograf la nunta',
    },
    {
        src: 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=900&q=80',
        alt: 'Eveniment corporate fotografiat',
    },
    {
        src: 'https://images.unsplash.com/photo-1523438885200-e635ba2c371e?auto=format&fit=crop&w=900&q=80',
        alt: 'Decor elegant pentru eveniment',
    },
];

const LandingPage = () => {
    return (
        <div className="app-shell min-h-screen">
            <Header />
            <main>
                <section className="landing-hero">
                    <div className="mx-auto flex min-h-[640px] w-full max-w-7xl items-end px-4 py-12 md:py-16">
                        <div className="max-w-3xl pb-8">
                            <p className="text-xl font-semibold uppercase text-teal-200 md:text-2xl">PhotoPortal</p>
                            <h1 className="mt-3 text-4xl font-bold leading-tight text-white md:text-6xl">
                                Servicii foto si video pentru evenimente memorabile
                            </h1>
                            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-100">
                                La PhotoPortal, gasesti fotografi si videografi profesionisti care iti pot transforma evenimentul intr-o amintire de neuitat.
                                Platforma noastra te ajuta sa alegi rapid pachetul potrivit pentru nunti, botezuri, aniversari, petreceri sau evenimente corporate.
                            </p>
                            <ul className="mt-4 max-w-2xl list-disc pl-5 text-base leading-7 text-slate-200">
                                <li>Cu ajutorul specialistilor nostri, fiecare moment important este surprins cu atentie, creativitate si profesionalism.</li>
                            </ul>
                            <div className="mt-8 flex flex-wrap gap-3">
                                <Link to={PATHS.SIGN_UP} className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950 hover:bg-slate-100">
                                    Logare in platforma
                                </Link>
                                <Link to={PATHS.OFFERS} className="rounded-lg border border-teal-200 px-5 py-3 font-semibold text-teal-100 hover:bg-teal-400/15">
                                    Vezi catalogul
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
                    <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                        {eventImages.map((image) => (
                            <img key={image.src} src={image.src} alt={image.alt} className="h-44 w-full rounded-lg object-cover shadow-sm lg:h-40" loading="lazy" />
                        ))}
                    </div>
                    <div>
                        <p className="text-lg font-semibold uppercase text-teal-700 md:text-xl">Transformam momentele speciale</p>
                        <h2 className="mt-2 text-3xl font-bold text-slate-950 md:text-4xl">In amintiri de neuitat</h2>
                        <div className="mt-5 space-y-4 text-base leading-7 text-slate-700">
                            <p>
                                PhotoPortal este o platforma dedicata serviciilor foto si video pentru evenimente importante din viata ta. Indiferent daca organizezi o
                                nunta, un botez, o aniversare, o petrecere privata sau un eveniment corporate, aici poti gasi fotografi si videografi profesionisti pregatiti
                                sa surprinda cele mai frumoase momente.
                            </p>
                            <p>
                                Colaboram cu specialisti calificati, pasionati de imagine, detalii si emotie. Fiecare fotograf din platforma isi propune sa ofere servicii de
                                calitate, adaptate nevoilor clientului, astfel incat evenimentul tau sa fie pastrat in imagini clare, expresive si pline de viata.
                            </p>
                            <p>
                                Prin intermediul PhotoPortal, procesul de alegere a unui pachet foto/video devine simplu, rapid si accesibil. Poti analiza ofertele disponibile,
                                poti compara serviciile incluse si poti selecta varianta potrivita pentru evenimentul tau.
                            </p>
                        </div>
                    </div>
                </section>

                <section className="bg-white/80 py-14">
                    <div className="mx-auto w-full max-w-7xl px-4">
                        <div className="max-w-3xl">
                            <p className="text-lg font-semibold uppercase text-teal-700 md:text-xl">De ce PhotoPortal?</p>
                            <h2 className="mt-2 text-3xl font-bold text-slate-950">De ce sa alegi PhotoPortal?</h2>
                            <p className="mt-4 text-base leading-7 text-slate-700">
                                PhotoPortal iti ofera acces la fotografi si videografi calificati, care pun accent pe calitate, seriozitate si atentie la detalii. Platforma
                                este gandita pentru a simplifica procesul de rezervare a serviciilor foto/video, oferind clientilor posibilitatea de a gasi rapid serviciul
                                potrivit pentru evenimentul dorit.
                            </p>
                            <p className="mt-3 text-base leading-7 text-slate-700">
                                Prin intermediul catalogului, poti descoperi diferite pachete, poti analiza ofertele disponibile si poti alege profesionistul care corespunde
                                cel mai bine asteptarilor tale.
                            </p>
                        </div>

                        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                            {featureCards.map((feature) => (
                                <article key={feature.title} className="soft-panel p-5">
                                    <h3 className="text-lg font-bold text-slate-950">{feature.title}</h3>
                                    <p className="mt-3 text-sm leading-6 text-slate-600">{feature.text}</p>
                                </article>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-14 lg:grid-cols-[1fr_420px] lg:items-center">
                    <div>
                        <h2 className="text-3xl font-bold text-slate-950">Pastreaza emotiile evenimentului tau</h2>
                        <p className="mt-4 text-base leading-7 text-slate-700">
                            Momentele frumoase trec repede, dar fotografiile si videoclipurile le pot pastra pentru totdeauna. Alege un fotograf potrivit din catalogul
                            PhotoPortal si bucura-te de servicii foto/video realizate cu profesionalism, creativitate si atentie la fiecare detaliu.
                        </p>
                        <p className="mt-4 text-base leading-7 text-slate-700">
                            Fiecare eveniment are propria poveste, iar noi credem ca aceasta poveste merita sa fie spusa prin imagini autentice. Echipa noastra de fotografi si
                            videografi este pregatita sa surprinda emotiile, zambetele, atmosfera si detaliile care fac diferenta.
                        </p>
                        <div className="mt-7 flex flex-wrap gap-3">
                            <Link to={PATHS.OFFERS} className="rounded-lg bg-slate-900 px-5 py-3 font-semibold text-white hover:bg-slate-700">
                                Alege o oferta
                            </Link>
                            <Link to={PATHS.SIGN_UP} className="rounded-lg border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-50">
                                Creeaza cont
                            </Link>
                        </div>
                    </div>
                    <img
                        src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80"
                        alt="Eveniment cu lumini si invitati"
                        className="h-[360px] w-full rounded-lg object-cover shadow-sm"
                        loading="lazy"
                    />
                </section>
            </main>
            <Footer />
        </div>
    );
};

export default LandingPage;
