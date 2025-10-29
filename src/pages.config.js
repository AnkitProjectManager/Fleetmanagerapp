import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import ServiceRequests from './pages/ServiceRequests';
import Administrators from './pages/Administrators';
import MechanicDashboard from './pages/MechanicDashboard';
import FleetClients from './pages/FleetClients';
import ServicesCatalog from './pages/ServicesCatalog';
import Technicians from './pages/Technicians';
import Invoices from './pages/Invoices';
import FleetControls from './pages/FleetControls';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Vehicles": Vehicles,
    "ServiceRequests": ServiceRequests,
    "Administrators": Administrators,
    "MechanicDashboard": MechanicDashboard,
    "FleetClients": FleetClients,
    "ServicesCatalog": ServicesCatalog,
    "Technicians": Technicians,
    "Invoices": Invoices,
    "FleetControls": FleetControls,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};