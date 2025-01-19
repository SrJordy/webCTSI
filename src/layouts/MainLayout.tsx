import Sidebar from '../components/SideBar';

const MainLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex h-screen overflow-hidden">
            <Sidebar />
            <div className="flex-1 overflow-y-auto  bg-[#C9E7F2] scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                <div className="p-8">
                    {children}
                </div>
            </div>
        </div>
    );
};

export default MainLayout;