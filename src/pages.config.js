import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import ServiceRequests from './pages/ServiceRequests';
import Administrators from './pages/Administrators';
import MechanicDashboard from './pages/MechanicDashboard';
import FleetClients from './pages/FleetClients';
import Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Vehicles": Vehicles,
    "ServiceRequests": ServiceRequests,
    "Administrators": Administrators,
    "MechanicDashboard": MechanicDashboard,
    "FleetClients": FleetClients,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: Layout,
};