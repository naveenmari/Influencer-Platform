import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import { AnimatePresence, motion } from 'framer-motion';

const pageVariants = {
    initial: {
        opacity: 0,
        y: 20
    },
    in: {
        opacity: 1,
        y: 0
    },
    out: {
        opacity: 0,
        y: -20
    }
};

const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
};

const Layout = () => {
    const location = useLocation();

    return (
        <div className="d-flex flex-column min-vh-100">
            <Navbar />
            <main className="flex-grow-1" style={{ paddingTop: '80px' }}>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
