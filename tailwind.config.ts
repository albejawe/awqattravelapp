import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					dark: 'hsl(var(--primary-dark))',
					light: 'hsl(var(--primary-light))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			backgroundImage: {
				'gradient-gold': 'var(--gradient-gold)',
				'gradient-gold-light': 'var(--gradient-gold-light)',
				'gradient-gold-dark': 'var(--gradient-gold-dark)',
				'gradient-elegant': 'var(--gradient-elegant)'
			},
			boxShadow: {
				'gold': 'var(--shadow-gold)',
				'gold-strong': 'var(--shadow-gold-strong)',
				'elegant': 'var(--shadow-elegant)'
			},
			fontFamily: {
				'arabic': ['Cairo', 'Amiri', 'Noto Sans Arabic', 'sans-serif']
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fadeIn 0.3s ease-out',
				'slide-up': 'slideUp 0.4s ease-out',
				'scale-in': 'scaleIn 0.3s ease-out',
				'bounce-in': 'bounceIn 0.5s ease-out',
				'slide-in-from-top': 'slideInFromTop 0.5s ease-out'
			},
			typography: {
				DEFAULT: {
					css: {
						maxWidth: 'none',
						color: 'hsl(var(--foreground))',
						lineHeight: '1.7',
						fontSize: '16px',
						h1: {
							color: 'hsl(var(--foreground))',
							fontWeight: '700',
							fontSize: '2.25rem',
							marginTop: '2rem',
							marginBottom: '1rem',
						},
						h2: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							fontSize: '1.875rem',
							marginTop: '1.75rem',
							marginBottom: '0.875rem',
						},
						h3: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							fontSize: '1.5rem',
							marginTop: '1.5rem',
							marginBottom: '0.75rem',
						},
						h4: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
							fontSize: '1.25rem',
							marginTop: '1.25rem',
							marginBottom: '0.5rem',
						},
						p: {
							marginTop: '1rem',
							marginBottom: '1rem',
						},
						a: {
							color: 'hsl(var(--primary))',
							textDecoration: 'underline',
							fontWeight: '500',
						},
						strong: {
							color: 'hsl(var(--foreground))',
							fontWeight: '600',
						},
						ul: {
							marginTop: '1rem',
							marginBottom: '1rem',
						},
						ol: {
							marginTop: '1rem',
							marginBottom: '1rem',
						},
						li: {
							marginTop: '0.5rem',
							marginBottom: '0.5rem',
						},
						blockquote: {
							fontStyle: 'italic',
							borderLeftWidth: '4px',
							borderLeftColor: 'hsl(var(--border))',
							paddingLeft: '1rem',
							marginTop: '1.5rem',
							marginBottom: '1.5rem',
							color: 'hsl(var(--muted-foreground))',
						},
						code: {
							color: 'hsl(var(--primary))',
							backgroundColor: 'hsl(var(--muted))',
							paddingLeft: '0.25rem',
							paddingRight: '0.25rem',
							paddingTop: '0.125rem',
							paddingBottom: '0.125rem',
							borderRadius: '0.25rem',
							fontSize: '0.875rem',
						},
						'code::before': {
							content: '""',
						},
						'code::after': {
							content: '""',
						},
						img: {
							borderRadius: '0.5rem',
							marginTop: '1.5rem',
							marginBottom: '1.5rem',
						},
					},
				},
			}
		}
	},
	plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
