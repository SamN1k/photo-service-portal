import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { router } from './routes/AppRouter';

function App() {
    return (
        <>
            <RouterProvider router={router} />
            <ToastContainer
                position="top-right"
                autoClose={2500}
                newestOnTop
                theme="colored"
                toastStyle={{ borderRadius: 12, fontSize: '0.9rem' }}
            />
        </>
    );
}

export default App;
