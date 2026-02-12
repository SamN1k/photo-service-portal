import MainPage from '../pages/MainPage.tsx';
import ErrorPage from '../pages/ErrorPage.tsx';
import { PageIds, ErrorTypes } from '../constants/constants';


export interface IPage {
    render(): HTMLElement;
}

type PageConstructor = new (id: string) => IPage;

const PageRegistry: Record<string, PageConstructor> = {
    [PageIds.MainPage]: MainPage,
};

export function navigateToPage(
    idPage: string,
    container: HTMLElement,
    defaultPageId: string
): void {
    // Normalize incoming id: remove leading # or / and trim
    const raw = (idPage ?? '').toString();
    const normalizedId = raw.replace(/^#|^\//, '').trim() || PageIds.MainPage;

    console.log('navigateToPage called with idPage:', idPage, 'normalizedId:', normalizedId);
    let page: IPage;

    const PageClass = PageRegistry[normalizedId];

    if (PageClass) {
        page = new PageClass(normalizedId);
    } else {
        console.log('Unknown page id, rendering ErrorPage for id:', normalizedId);
        page = new ErrorPage(normalizedId, ErrorTypes.Error_404) as unknown as IPage;
    }

    const pageHTML = page.render();
    pageHTML.id = defaultPageId;
    
    container.innerHTML = '';
    container.append(pageHTML);
}