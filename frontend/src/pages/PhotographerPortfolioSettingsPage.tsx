import { useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

import { PageHeader } from '../components/ui/PageHeader';
import { ErrorState, LoadingState } from '../components/ui/StatusMessage';
import { useAuth } from '../context/useAuth';
import { PATHS } from '../routes/paths';
import { isMockHttpError } from '../services/mockHttp';
import { userService } from '../services/userService';
import type { PhotographerPortfolio } from '../types/models';

interface PortfolioForm {
    fullName: string;
    email: string;
    phoneNumber: string;
    profileImageUrl: string;
    description: string;
    galleryImageUrls: string[];
}

type PortfolioErrors = Partial<Record<keyof PortfolioForm, string>>;
type TextPortfolioField = Exclude<keyof PortfolioForm, 'galleryImageUrls'>;

const emptyForm: PortfolioForm = {
    fullName: '',
    email: '',
    phoneNumber: '',
    profileImageUrl: '',
    description: '',
    galleryImageUrls: [],
};

const toForm = (portfolio: PhotographerPortfolio): PortfolioForm => ({
    fullName: portfolio.fullName,
    email: portfolio.email,
    phoneNumber: portfolio.phoneNumber,
    profileImageUrl: portfolio.profileImageUrl,
    description: portfolio.description,
    galleryImageUrls: portfolio.galleryImageUrls,
});

const readImageAsDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            if (typeof reader.result !== 'string') {
                reject(new Error('Imaginea nu a putut fi citita.'));
                return;
            }

            resolve(reader.result);
        };

        reader.onerror = () => reject(new Error('Imaginea nu a putut fi citita.'));
        reader.readAsDataURL(file);
    });
};

const PhotographerPortfolioSettingsPage = () => {
    const { user, refreshUser } = useAuth();
    const [form, setForm] = useState<PortfolioForm>(emptyForm);
    const [errors, setErrors] = useState<PortfolioErrors>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    useEffect(() => {
        const loadPortfolio = async () => {
            if (!user) {
                return;
            }

            setIsLoading(true);
            setLoadError(null);

            try {
                const portfolio = await userService.getPhotographerPortfolio(user.id);
                setForm(toForm(portfolio));
            } catch (error) {
                const message = isMockHttpError(error) ? error.message : 'Portofoliul nu a putut fi incarcat.';
                setLoadError(message);
            } finally {
                setIsLoading(false);
            }
        };

        void loadPortfolio();
    }, [user]);

    const updateField = (field: TextPortfolioField, value: string) => {
        setForm((currentForm) => ({ ...currentForm, [field]: value }));
        setErrors((currentErrors) => ({ ...currentErrors, [field]: undefined }));
    };

    const validateForm = () => {
        const nextErrors: PortfolioErrors = {};
        if (form.fullName.trim().length < 3) {
            nextErrors.fullName = 'Numele trebuie sa aiba minimum 3 caractere.';
        }

        if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
            nextErrors.email = 'Introdu un email valid.';
        }

        if (form.phoneNumber.trim().length > 64) {
            nextErrors.phoneNumber = 'Numarul de telefon este prea lung.';
        }

        if (form.galleryImageUrls.length > 12) {
            nextErrors.galleryImageUrls = 'Galeria poate contine maximum 12 imagini.';
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!user || !validateForm()) {
            return;
        }

        setIsSubmitting(true);

        try {
            const portfolio = await userService.updatePhotographerPortfolio(user.id, {
                fullName: form.fullName,
                email: form.email,
                phoneNumber: form.phoneNumber,
                profileImageUrl: form.profileImageUrl,
                description: form.description,
                galleryImageUrls: form.galleryImageUrls,
            });

            setForm(toForm(portfolio));
            refreshUser({
                ...user,
                fullName: portfolio.fullName,
                email: portfolio.email,
                phoneNumber: portfolio.phoneNumber,
                profileImageUrl: portfolio.profileImageUrl,
                portfolioDescription: portfolio.description,
                portfolioGalleryImageUrls: portfolio.galleryImageUrls,
            });
            toast.success('Portofoliul a fost actualizat.');
        } catch (error) {
            const message = isMockHttpError(error) ? error.message : 'Portofoliul nu a putut fi actualizat.';
            toast.error(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleProfileImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];

        if (!file) {
            return;
        }

        if (!file.type.startsWith('image/')) {
            toast.error('Alege un fisier imagine pentru poza de profil.');
            event.target.value = '';
            return;
        }

        try {
            const profileImageUrl = await readImageAsDataUrl(file);
            updateField('profileImageUrl', profileImageUrl);
        } catch {
            toast.error('Imaginea de profil nu a putut fi incarcata.');
        } finally {
            event.target.value = '';
        }
    };

    const handleGalleryImagesChange = async (event: ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);

        if (files.length === 0) {
            return;
        }

        const invalidFile = files.find((file) => !file.type.startsWith('image/'));

        if (invalidFile) {
            toast.error('Alege doar fisiere imagine pentru galerie.');
            event.target.value = '';
            return;
        }

        if (form.galleryImageUrls.length + files.length > 12) {
            toast.error('Galeria poate contine maximum 12 imagini.');
            event.target.value = '';
            return;
        }

        try {
            const nextImages = await Promise.all(files.map(readImageAsDataUrl));
            setForm((currentForm) => ({
                ...currentForm,
                galleryImageUrls: [...currentForm.galleryImageUrls, ...nextImages],
            }));
            setErrors((currentErrors) => ({ ...currentErrors, galleryImageUrls: undefined }));
        } catch {
            toast.error('Una dintre imaginile din galerie nu a putut fi incarcata.');
        } finally {
            event.target.value = '';
        }
    };

    const removeGalleryImage = (imageUrl: string) => {
        setForm((currentForm) => ({
            ...currentForm,
            galleryImageUrls: currentForm.galleryImageUrls.filter((currentImageUrl) => currentImageUrl !== imageUrl),
        }));
    };

    return (
        <div className="space-y-6">
            <PageHeader
                title="Setari portofoliu"
                description="Completeaza cartea ta de vizita pentru clientii care iti vad ofertele."
            />

            {isLoading && <LoadingState title="Se incarca portofoliul..." />}

            {!isLoading && loadError && <ErrorState title="Portofoliu indisponibil" message={loadError} />}

            {!isLoading && !loadError && (
                <>
                    <form className="soft-panel grid gap-5 p-5 lg:grid-cols-2" onSubmit={handleSubmit} noValidate>
                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-name">
                                Nume fotograf
                            </label>
                            <input
                                id="portfolio-name"
                                value={form.fullName}
                                onChange={(event) => updateField('fullName', event.target.value)}
                                className="form-input"
                                placeholder="Radu Ionescu"
                            />
                            {errors.fullName && <p className="field-error">{errors.fullName}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-email">
                                Email
                            </label>
                            <input
                                id="portfolio-email"
                                type="email"
                                value={form.email}
                                onChange={(event) => updateField('email', event.target.value)}
                                className="form-input"
                                placeholder="photographer@demo.local"
                            />
                            {errors.email && <p className="field-error">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-phone">
                                Numar de telefon
                            </label>
                            <input
                                id="portfolio-phone"
                                value={form.phoneNumber}
                                onChange={(event) => updateField('phoneNumber', event.target.value)}
                                className="form-input"
                                placeholder="+373 69 000 000"
                            />
                            {errors.phoneNumber && <p className="field-error">{errors.phoneNumber}</p>}
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-profile-image">
                                Imagine profil
                            </label>
                            <div className="grid gap-3 sm:grid-cols-[96px_1fr] sm:items-center">
                                <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                                    {form.profileImageUrl ? (
                                        <img
                                            src={form.profileImageUrl}
                                            alt="Previzualizare profil fotograf"
                                            className="h-24 w-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-24 items-center justify-center px-2 text-center text-xs font-semibold text-slate-500">
                                            Profil
                                        </div>
                                    )}
                                </div>
                                <input
                                    id="portfolio-profile-image"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) => void handleProfileImageChange(event)}
                                    className="form-input"
                                />
                            </div>
                        </div>

                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-description">
                                Descriere
                            </label>
                            <textarea
                                id="portfolio-description"
                                value={form.description}
                                onChange={(event) => updateField('description', event.target.value)}
                                className="form-input min-h-32"
                                placeholder="Scrie cateva randuri despre stilul tau, tipurile de evenimente si experienta."
                            />
                        </div>

                        <div className="lg:col-span-2">
                            <label className="mb-2 block text-sm font-semibold text-slate-800" htmlFor="portfolio-gallery">
                                Galerie
                            </label>
                            <input
                                id="portfolio-gallery"
                                type="file"
                                accept="image/*"
                                multiple
                                onChange={(event) => void handleGalleryImagesChange(event)}
                                className="form-input"
                            />
                            {errors.galleryImageUrls && <p className="field-error">{errors.galleryImageUrls}</p>}
                            <p className="mt-2 text-xs text-slate-500">
                                Selecteaza imaginile reusite din computerul tau. Poti adauga maximum 12 fotografii.
                            </p>
                        </div>

                        <div className="flex flex-wrap gap-3 lg:col-span-2">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-70"
                            >
                                {isSubmitting ? 'Se salveaza...' : 'Salveaza portofoliul'}
                            </button>

                            {user && (
                                <Link
                                    to={PATHS.PHOTOGRAPHER_PUBLIC_PORTFOLIO.replace(':photographerId', user.id)}
                                    className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
                                >
                                    Vezi pagina publica
                                </Link>
                            )}
                        </div>
                    </form>

                    <section>
                        <h2 className="text-2xl font-bold text-slate-950">Previzualizare galerie</h2>
                        {form.galleryImageUrls.length > 0 ? (
                            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                                {form.galleryImageUrls.map((imageUrl) => (
                                    <article
                                        key={imageUrl}
                                        className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm"
                                    >
                                        <img
                                            src={imageUrl}
                                            alt="Previzualizare lucrare portofoliu"
                                            className="h-48 w-full object-cover"
                                            loading="lazy"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeGalleryImage(imageUrl)}
                                            className="w-full border-t border-slate-200 px-3 py-2 text-sm font-semibold text-rose-700 hover:bg-rose-50"
                                        >
                                            Sterge imaginea
                                        </button>
                                    </article>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-2 text-sm text-slate-600">Selecteaza imagini pentru a le vedea in galerie.</p>
                        )}
                    </section>
                </>
            )}
        </div>
    );
};

export default PhotographerPortfolioSettingsPage;
