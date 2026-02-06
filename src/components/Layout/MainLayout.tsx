import * as React from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import './MainLayout.css';

interface MainLayoutProps {
    children: React.ReactNode;
    title?: string;
    breadcrumbs?: { label: string; path?: string }[];
}

export const MainLayout = ({ children, title, breadcrumbs }: MainLayoutProps) => {
    return (
        <div className="app-container">
            <Sidebar />
            <div className="main-content">
                <TopBar title={title} breadcrumbs={breadcrumbs} />
                <main className="content-area">
                    {children}
                </main>
            </div>
        </div>
    );
};
