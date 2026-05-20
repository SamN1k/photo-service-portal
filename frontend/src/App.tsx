import { RouterProvider } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AxiosProvider } from './api/context/AxiosContext';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { router } from './routes/AppRouter';

function App() {
    return (
        <ThemeProvider>
            <AxiosProvider>
                <AuthProvider>
                    <RouterProvider router={router} />

                    <ToastContainer
                        position="top-right"
                        autoClose={2500}
                        newestOnTop
                        theme="colored"
                        toastStyle={{
                            borderRadius: 8,
                            fontSize: '0.9rem',
                        }}
                    />
                </AuthProvider>
            </AxiosProvider>
        </ThemeProvider>
    );

}

export default App;
