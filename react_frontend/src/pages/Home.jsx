import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.3
        }
    }
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut"
        }
    }
};

const Home = () => {
    return (
        <>
            <div className="hero-wrapper" style={{ position: 'relative', zIndex: 1 }}>
                <motion.div
                    className="container hero"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.h1 className="display-4 fw-bold mb-4" variants={itemVariants}>
                        Connect. Collaborate.<br />Create.
                    </motion.h1>
                    <motion.p className="lead mb-5" variants={itemVariants}>
                        The minimalist platform for influencers and brands to build meaningful partnerships. Showcase
                        your work, simplified.
                    </motion.p>
                    <motion.div className="d-flex justify-content-center gap-3" variants={itemVariants}>
                        <Link to="/register" className="btn btn-primary px-5">Get Started</Link>
                        <Link to="/login" className="btn btn-outline-primary px-5">Login</Link>
                    </motion.div>
                </motion.div>
            </div>

            <div className="container pb-5">
                <div className="row g-4">
                    {[
                        { title: "For Brands", desc: "Create campaigns, find influencers, and track your success." },
                        { title: "For Influencers", desc: "Find sponsorship opportunities and get paid for your content." },
                        { title: "Secure & Fast", desc: "Built with modern technology to ensure reliability." }
                    ].map((item, index) => (
                        <div className="col-md-4" key={index}>
                            <motion.div
                                className="h-100 p-4"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2, duration: 0.5 }}
                            >
                                <h3 className="h4 mb-3">{item.title}</h3>
                                <p className="text-secondary">{item.desc}</p>
                            </motion.div>
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
};

export default Home;
