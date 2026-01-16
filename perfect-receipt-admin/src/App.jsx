import { AdminProvider } from "./context/AdminContext";
import { BrowserRouter, Routes, Route } from "react-router-dom"
import AdminRoutes from "./routes/adminRoutes";
import {Toaster} from "react-hot-toast";

function App() {
    return (
        <AdminProvider>
            <BrowserRouter>
                <Routes>
                    {/* Regular app routes */}
                    <Route path="/*" element={<AdminRoutes />} />
                </Routes>
            </BrowserRouter>
            
            <Toaster
                toastOptions={{
                className: "",
                style: {
                    fontSize: "13px",
                }
                }}
            />
        </AdminProvider>
    );
}

export default App; 