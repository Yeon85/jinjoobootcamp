/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const rotateX = plugin(function ({ addUtilities }) {
    addUtilities({
        '.rotate-y-180': {
            transform: 'rotateY(180deg)',
        },
    });
});
module.exports = {
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
    darkMode: 'class',
    theme: {
        container: {
            center: true,
        },
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#4361ee',
                    light: '#eaf1ff',
                    'dark-light': 'rgba(67,97,238,.15)',
                },
                secondary: {
                    DEFAULT: '#805dca',
                    light: '#ebe4f7',
                    'dark-light': 'rgb(128 93 202 / 15%)',
                },
                success: {
                    DEFAULT: '#00ab55',
                    light: '#ddf5f0',
                    'dark-light': 'rgba(0,171,85,.15)',
                },
                danger: {
                    DEFAULT: '#e7515a',
                    light: '#fff5f5',
                    'dark-light': 'rgba(231,81,90,.15)',
                },
                warning: {
                    DEFAULT: '#e2a03f',
                    light: '#fff9ed',
                    'dark-light': 'rgba(226,160,63,.15)',
                },
                info: {
                    DEFAULT: '#2196f3',
                    light: '#e7f7ff',
                    'dark-light': 'rgba(33,150,243,.15)',
                },
                dark: {
                    DEFAULT: '#3b3f5c',
                    light: '#eaeaec',
                    'dark-light': 'rgba(59,63,92,.15)',
                },
                black: {
                    DEFAULT: '#0e1726',
                    light: '#e3e4eb',
                    'dark-light': 'rgba(14,23,38,.15)',
                },
                white: {
                    DEFAULT: '#ffffff',
                    light: '#e0e6ed',
                    dark: '#888ea8',
                },front: {
                    DEFAULT: '#d946ef', // bg-fuchsia-500
                    light: '#fce7f3',   // 밝은 fuchsia-200 근처
                    dark: '#a21caf',    // 진한 fuchsia-700 근처
                  },
                  database: {
                    DEFAULT: '#a855f7', // bg-purple-500
                    light: '#ede9fe',   // 밝은 purple-200
                    dark: '#6b21a8',    // 진한 purple-700
                  },
                  server: {
                    DEFAULT: '#3b82f6', // bg-blue-500
                    light: '#dbeafe',   // 밝은 blue-200
                    dark: '#1d4ed8',    // 진한 blue-700
                  },
                  cloud: {
                    DEFAULT: '#ef4444', // bg-red-500
                    light: '#fee2e2',   // 밝은 red-200
                    dark: '#b91c1c',    // 진한 red-700
                  },
                  interview: {
                    DEFAULT: '#fb923c', // bg-orange-400
                    light: '#ffedd5',   // 밝은 orange-100
                    dark: '#ea580c',    // 진한 orange-700
                  },
                  career: {
                    DEFAULT: '#fbbf24', // bg-amber-400
                    light: '#fef3c7',   // 밝은 amber-100
                    dark: '#b45309',    // 진한 amber-700
                  },
                  project2d: {
                    DEFAULT: '#a3e635', // bg-lime-400
                    light: '#ecfccb',   // 밝은 lime-100
                    dark: '#65a30d',    // 진한 lime-700
                  },
                  project3d: {
                    DEFAULT: '#4ade80', // bg-green-400
                    light: '#dcfce7',   // 밝은 green-100
                    dark: '#15803d',    // 진한 green-700
                  },
                  graduation: {
                    DEFAULT: '#22d3ee', // bg-cyan-400
                    light: '#cffafe',   // 밝은 cyan-100
                    dark: '#0e7490',    // 진한 cyan-700
                  },
                  ot: {
                    DEFAULT: '#f43f5e', // bg-rose-500
                    light: '#ffe4e6',   // 밝은 rose-100
                    dark: '#be123c',    // 진한 rose-700
                  },
                  emp: {
                    DEFAULT: '#8b5cf6', // bg-violet-500
                    light: '#ede9fe',   // 밝은 violet-200
                    dark: '#6d28d9',    // 진한 violet-700
                  },
            },
            fontFamily: {
                nunito: ['Nunito', 'sans-serif'],
            },
            spacing: {
                4.5: '18px',
            },
            boxShadow: {
                '3xl': '0 2px 2px rgb(224 230 237 / 46%), 1px 6px 7px rgb(224 230 237 / 46%)',
            },
            typography: ({ theme }) => ({
                DEFAULT: {
                    css: {
                        '--tw-prose-invert-headings': theme('colors.white.dark'),
                        '--tw-prose-invert-links': theme('colors.white.dark'),
                        h1: { fontSize: '40px', marginBottom: '0.5rem', marginTop: 0 },
                        h2: { fontSize: '32px', marginBottom: '0.5rem', marginTop: 0 },
                        h3: { fontSize: '28px', marginBottom: '0.5rem', marginTop: 0 },
                        h4: { fontSize: '24px', marginBottom: '0.5rem', marginTop: 0 },
                        h5: { fontSize: '20px', marginBottom: '0.5rem', marginTop: 0 },
                        h6: { fontSize: '16px', marginBottom: '0.5rem', marginTop: 0 },
                        p: { marginBottom: '0.5rem' },
                        li: { margin: 0 },
                        img: { margin: 0 },
                    },
                },
            }),
        },
    },
    plugins: [
        require('@tailwindcss/forms')({
            strategy: 'class',
        }),
        require('@tailwindcss/typography'),
        rotateX,
    ],
};
