import { Outlet } from 'react-router-dom';

export default function Layout() {
    return (
        <div className="min-h-screen text-white relative overflow-hidden">
            {/* Background effects could go here */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[100px]" />
            </div>

            <main className="container mx-auto px-4 py-6 h-screen flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}
