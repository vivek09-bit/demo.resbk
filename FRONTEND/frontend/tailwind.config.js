/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Primary Colors (Orange/Warm)
                primary: {
                    DEFAULT: '#FF6B35',
                    foreground: 'hsl(var(--primary-foreground))',
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#FF6B35', // Main primary
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    950: '#431407',
                },

                // Secondary Colors (Cyan/Teal)
                secondary: {
                    DEFAULT: '#00B4D8',
                    foreground: 'hsl(var(--secondary-foreground))',
                    50: '#cffafe',
                    100: '#a5f3fc',
                    200: '#67e8f9',
                    300: '#06b6d4',
                    400: '#00B4D8', // Main secondary
                    500: '#0891b2',
                    600: '#0e7490',
                    700: '#155e75',
                    800: '#164e63',
                    900: '#0f3444',
                    950: '#082f49',
                },

                // Neutral Colors
                neutral: {
                    50: '#f9fafb',
                    100: '#f3f4f6',
                    200: '#e5e7eb',
                    300: '#d1d5db',
                    400: '#9ca3af',
                    500: '#6b7280',
                    600: '#4b5563',
                    700: '#374151',
                    800: '#1f2937',
                    900: '#111827',
                    950: '#0F172A',
                },

                // Main Theme Colors (Light Theme)
                dark: {
                    bg: '#f7f0e2',      // Cream/Off-white background
                    surface: '#f1f0ef', // Pure white card background
                    'surface-light': '#f3f4f6', // Light hover state
                    border: '#e5e7eb',  // Subtle border
                },

                // Status Colors
                status: {
                    available: '#10B981',  // Green
                    occupied: '#EF4444',   // Red
                    reserved: '#F59E0B',   // Amber
                    billing: '#3B82F6',    // Blue
                    maintenance: '#6B7280', // Gray
                },

                // Text Colors (CORRECTED: Now Dark/Black for Light Theme)
                text: {
                    primary: '#111827',   // Almost Black (Neutral 900)
                    secondary: '#4c5158', // Dark Gray (Neutral 600)
                    tertiary: '#727a86',  // Medium Gray (Neutral 400)
                    disabled: '#D1D5DB',  // Light Gray (Neutral 300)
                },

                // Special Colors
                accent: {
                    gold: '#FCD34D',       // Warm gold
                    warmOrange: '#FF6B35', // Restaurant warm
                },

                // ========== SHADCN/UI Semantic Colors ==========
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                'chart-1': 'hsl(var(--chart-1))',
                'chart-2': 'hsl(var(--chart-2))',
                'chart-3': 'hsl(var(--chart-3))',
                'chart-4': 'hsl(var(--chart-4))',
                'chart-5': 'hsl(var(--chart-5))',
                // ==============================================
            },

            // Custom spacing
            spacing: {
                'safe': 'var(--safe-area-inset-left)',
            },

            // Custom border radius
            borderRadius: {
                'xl': '12px',
                '2xl': '16px',
            },

            // Custom shadows (Adjusted opacity for Light Theme)
            boxShadow: {
                'dark-sm': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                'dark': '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
            },

            // Custom animations
            animation: {
                'slide-in': 'slideIn 0.3s ease-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'accordion-down': 'accordionDown 0.2s ease-out',
                'accordion-up': 'accordionUp 0.2s ease-out',
            },
            keyframes: {
                slideIn: {
                    '0%': { transform: 'translateX(100%)' },
                    '100%': { transform: 'translateX(0)' },
                },
                slideUp: {
                    '0%': { transform: 'translateX(-50%) translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateX(-50%) translateY(0)', opacity: '1' },
                },
                accordionDown: {
                    from: { height: '0' },
                    to: { height: 'var(--accordion-panel-height)' },
                },
                accordionUp: {
                    from: { height: 'var(--accordion-panel-height)' },
                    to: { height: '0' },
                },
            },
        },
    },
    plugins: [
        function ({ addBase, theme }) {
            addBase({
                'input:focus, textarea:focus, select:focus': {
                    borderColor: theme('colors.primary.300'),
                    outline: 'none',
                    boxShadow: `0 0 0 3px ${theme('colors.primary.200')}60`,
                },
                'input:hover, textarea:hover, select:hover': {
                    borderColor: theme('colors.primary.300'),
                },
            })
        },
        require("tailwindcss-animate"),
    ],
}