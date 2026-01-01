/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./public/index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // You can extend the theme here if you need custom colors or fonts later
        },
    },
    plugins: [],
    // Optional: Enable class-based dark mode if you want to toggle it manually
    // darkMode: 'class',
}
