/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            backdropBlur: {
                xs: '2px',
            },
            colors: {
                orbital: {
                    positive: '#4facfe',
                    negative: '#f093fb',
                }
            }
        },
    },
    plugins: [],
}
