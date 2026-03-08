# Evaluare arhitectură web: SPA vs non-SPA

## Concluzie
Aplicația este deja realizată ca **SPA (Single Page Application)**.

## Dovezi tehnice
- Aplicația React este montată într-un singur container `#root`, specific SPA.
- Rutarea este configurată cu `createBrowserRouter` și `RouterProvider`, ceea ce arată navigare client-side (fără reload complet al paginii).
- Există mai multe rute gestionate în frontend (`/`, `/login`, `/offers`, dashboard-uri etc.), toate orchestrate de routerul React.

## Ce ai face dacă NU ar fi SPA
Dacă proiectul ar fi fost server-rendered multipage, pentru a-l transforma în SPA pașii principali ar fi:
1. Introducerea unui entry unic (`index.html` + `main.tsx`) și montarea aplicației într-un container unic.
2. Mutarea routing-ului în client (`react-router-dom`) și definirea rutelor cu componente React.
3. Configurarea serverului/proxy-ului pentru fallback la `index.html` pe rute necunoscute (ex: Nginx/Apache/Vercel rewrite).
4. Separarea datelor de UI prin API-uri (`axios/fetch`) pentru schimbare de view fără refresh complet.

## Îmbunătățiri recomandate pentru SPA-ul actual
- **Code splitting lazy** pe pagini (`React.lazy`, `Suspense`) pentru timp mai bun la first load.
- **Error boundary** la nivel de rută/aplicație pentru reziliență.
- **Route-level loading states** pentru UX mai bun la fetch-uri lente.
- **Server rewrite explicit** în deployment pentru a evita 404 la refresh pe rute interne.
