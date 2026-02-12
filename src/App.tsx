import { useEffect, useRef, useState } from 'react';
import { navigateToPage } from './routes/PageRouter';
import { PageIds } from './constants/constants';
import './App.css';

function App() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentPage, setCurrentPage] = useState<string>(PageIds.MainPage);
    const defaultPageId = 'current-page';

    useEffect(() => {
        if (containerRef.current) {
            const navigateToPageById = (pageId: string) => {
                if (containerRef.current) {
                    navigateToPage(pageId, containerRef.current, defaultPageId);
                    
                    const validPages = [PageIds.MainPage];
                    if (validPages.includes(pageId as any)) {
                        setCurrentPage(pageId);
                    }
                }
            };

            const initialHash = window.location.hash.slice(1);
            if (initialHash) {
                navigateToPageById(initialHash);
            } else {
                navigateToPageById(PageIds.MainPage);
            }

            const handleHashChange = () => {
                const pageId = window.location.hash.slice(1) || PageIds.MainPage;
                navigateToPageById(pageId);
            };

            window.addEventListener('hashchange', handleHashChange);

            return () => {
                window.removeEventListener('hashchange', handleHashChange);
            };
        }
    }, []);

    return (
        <div className="app-container">
            <div className="navbar">
                <a 
                    href={`#${PageIds.MainPage}`}
                    className={currentPage === PageIds.MainPage ? 'active' : ''}
                >
                    Main
                </a>
            </div>
            <div 
                ref={containerRef} 
                className="page-container"
                style={{ minHeight: 'calc(100vh - 60px)' }}
            />
        </div>
    );
}

export default App;