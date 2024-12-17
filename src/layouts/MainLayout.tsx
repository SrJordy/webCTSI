import Sidebar from '../components/SideBar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen">
            <Sidebar />
            <div className="flex-1 p-8 bg-gray-100">
                {children}
            </div>
        </div>
    );
};

export default MainLayout;
