# Photo Service Portal

Aplicatie demo cu frontend React + TypeScript si backend ASP.NET Core Web API.

## Rulare

Backend-ul trebuie pornit inainte de autentificare, inregistrare si dashboard-uri.

Configurarea implicita foloseste PostgreSQL local:

```json
"DefaultConnection": "Host=localhost;Port=5432;Database=psp_photo_portal;Username=postgres;Password=12345678"
```

Daca ai alta parola sau alta baza de date, modifica `backend/PSP.API/appsettings.json`
sau seteaza variabila `PSP_CONNECTION_STRING`.

Migrarea initiala este generata in `backend/PSP.DataAccessLayer/Migrations`.
Aplica schema pe baza de date dupa ce PostgreSQL este pornit:

```bash
cd backend
dotnet ef database update --project PSP.DataAccessLayer/PSP.DataAccessLayer.csproj --startup-project PSP.API/PSP.API.csproj --context PhotoPortalDbContext
```

La pornirea API-ului se ruleaza automat migrarile lipsa si seed-ul initial, doar daca tabela `Users` este goala.

```bash
cd backend
dotnet run --project PSP.API/PSP.API.csproj --launch-profile http
```

API-ul ruleaza local la `http://localhost:5280/api`.

Intr-un terminal separat:

```bash
cd frontend
npm install
npm run dev
```

Aplicatia ruleaza implicit la `http://127.0.0.1:5173/`.

## Conturi demo

Toate conturile folosesc parola `demo1234`.

| Rol | Email |
| --- | --- |
| User | `user@demo.local` |
| Fotograf | `photographer@demo.local` |
| Admin | `admin@demo.local` |

## Functionalitati

- autentificare si inregistrare prin ASP.NET Core Web API;
- sesiune restaurata din `localStorage`;
- rute protejate pentru `user`, `photographer` si `admin`;
- CRUD cu validari pentru rezervari, oferte si utilizatori persistate in PostgreSQL prin EF Core;
- listare cu cautare, filtrare, sortare si paginare executate in BusinessLayer pe baza de date;
- stari UI de loading, empty si error;
- pagini dedicate pentru `401`, `403`, `404` si `500`;
- layout responsive cu header, sidebar si footer.

## Verificare

```bash
npm run lint
npm run build
```
