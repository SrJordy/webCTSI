import Sidebar from '../components/SideBar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto  bg-gradient-to-br from-red-50 to-pink-50 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;