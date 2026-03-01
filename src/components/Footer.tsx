const Footer = () => {
    return (
        <footer className="bg-white border-t border-gray-200 py-8 px-6 mt-auto">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-gray-500 text-sm">
                    &copy; {new Date().getFullYear()} Photo Service Portal. All rights reserved.
                </p>

                <div className="flex gap-6 text-sm text-gray-500">
                    <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                    <a href="#" className="hover:text-blue-600">Terms of Service</a>
                    <a href="#" className="hover:text-blue-600">Contact Us</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;