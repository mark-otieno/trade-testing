import React from 'react';
import { NavLink } from 'react-router-dom';

const navItems = [
    { label: 'Dashboard', path: '/' },
    { label: 'Bot Builder', path: '/bot-builder' },
    { label: 'D trader', path: '/d-trader' },
    { label: 'Tutorials', path: '/tutorials' },
    { label: 'Analysis Tool', path: '/analysis-tool' },
    { label: 'DP Tool', path: '/dp-tool' },
    { label: 'Analysis', path: '/analysis' },
    { label: 'Free Bots', path: '/free-bots' },
    { label: 'AI', path: '/ai' },
    { label: 'Copy Trading', path: '/copy-trading' }, // ✅ now in navbar
    { label: 'Trading View', path: '/trading-view' },
    { label: 'Risk Manager', path: '/risk-manager' },
];

export default function CustomNavbar() {
    return (
        <nav
            style={{
                background: '#001855', // dark blue theme
                color: '#fff',
                padding: '0.5rem 1rem',
                display: 'flex',
                alignItems: 'center',
                borderBottom: '4px solid #ff2634',
                fontFamily: 'inherit',
                fontWeight: 'bold',
                fontSize: '1rem',
            }}
        >
            {navItems.map(item => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    style={({ isActive }) => ({
                        color: '#fff',
                        textDecoration: 'none',
                        marginRight: 24,
                        padding: '8px 12px',
                        borderRadius: '4px',
                        background: isActive ? '#003080' : 'transparent', // active tab highlight
                        transition: 'background 0.2s',
                    })}
                >
                    {item.label}
                </NavLink>
            ))}
        </nav>
    );
}
