/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "#6366f1", // Indigo 500
                secondary: "#ec4899", // Pink 500
                dark: "#000000", // Pure Black
                card: "#0a0a0a", // Near Black
                border: "#1a1a1a", // Deep Gray
                surface: "#121212", // Surface Gray
            },
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
                heading: ['Space Grotesk', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
