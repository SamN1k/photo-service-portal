# Photo Service Portal

Aplicatie demo Frontend realizata in React + TypeScript, fara backend. Datele sunt mock si sunt persistate in `localStorage`.

## Rulare

```bash
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

- autentificare simulata si sesiune restaurata din `localStorage`;
- rute protejate pentru `user`, `photographer` si `admin`;
- CRUD cu validari pentru rezervari, oferte si utilizatori;
- listare cu cautare, filtrare, sortare si paginare gestionate in servicii mock;
- stari UI de loading, empty si error;
- pagini dedicate pentru `401`, `403`, `404` si `500`;
- layout responsive cu header, sidebar si footer.

## Verificare

```bash
npm run lint
npm run build
```
