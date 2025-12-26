/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Clean Black Theme
                primary: {
                    DEFAULT: "#6366f1", // Indigo 500
                    hover: "#4f46e5",   // Indigo 600
                    light: "#818cf8",   // Indigo 400
                },
                secondary: {
                    DEFAULT: "#8b5cf6", // Violet 500
                    hover: "#7c3aed",   // Violet 600
                },
                success: {
                    DEFAULT: "#10b981", // Emerald 500
                },
                dark: "#000000",        // Pure Black
                "dark-lighter": "#0a0a0a", // Slightly lighter black
                card: "#1a1a1a",        // Dark gray for cards
                sidebar: "#000000",     // Pure Black
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'float': 'float 3s ease-in-out infinite',
                'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                }
            }
        },
    },
    plugins: [],
}
