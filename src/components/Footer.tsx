const Footer = () => {
    return (
        <footer className="border-t border-slate-200 bg-white/90 px-6 py-5">
            <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-between gap-2 text-sm text-slate-500 md:flex-row">
                <p>&copy; {new Date().getFullYear()} Photo Service Portal.</p>
                <div className="flex gap-5">
                    <a href="#" className="hover:text-blue-600">Privacy</a>
                    <a href="#" className="hover:text-blue-600">Terms</a>
                    <a href="#" className="hover:text-blue-600">Support</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
