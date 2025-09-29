
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
			screens: {
				'xs': '475px',
				'3xl': '1600px',
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
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
				},
				'accent-legal': 'hsl(var(--accent-legal))',
				'success': 'hsl(var(--success))',
				'warning': 'hsl(var(--warning))',
				'info': 'hsl(var(--info))',
				'store': {
					primary: 'hsl(var(--store-primary))',
					secondary: 'hsl(var(--store-secondary))',
					accent: 'hsl(var(--store-accent))'
				},
				'community': {
					primary: 'hsl(var(--community-primary))',
					secondary: 'hsl(var(--community-secondary))',
					accent: 'hsl(var(--community-accent))'
				},
				'premium': {
					primary: 'hsl(var(--premium-primary))',
					secondary: 'hsl(var(--premium-secondary))',
					accent: 'hsl(var(--premium-accent))'
				},
				'footer': {
					bg: 'hsl(var(--footer-bg))',
					border: 'hsl(var(--footer-border))',
					active: 'hsl(var(--footer-active))',
					hover: 'hsl(var(--footer-hover))'
				},
				'tools': {
					primary: 'hsl(var(--tools-primary))',
					secondary: 'hsl(var(--tools-secondary))',
					accent: 'hsl(var(--tools-accent))'
				},
				'vademecum': {
					yellow: 'hsl(45 100% 55%)',
					'yellow-hover': 'hsl(45 100% 65%)',
					'yellow-text': 'hsl(45 100% 45%)',
					bg: 'hsl(0 0% 5%)',
					card: 'hsl(0 0% 8%)',
					border: 'hsl(0 0% 15%)',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(100%)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'slide-up': {
					'0%': { transform: 'translateY(20px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-in-left': {
					'0%': { transform: 'translateX(-100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'slide-in-right': {
					'0%': { transform: 'translateX(100%)', opacity: '0' },
					'100%': { transform: 'translateX(0)', opacity: '1' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.8)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'bounce-soft': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'wiggle': {
					'0%, 100%': { transform: 'rotate(0deg)' },
					'25%': { transform: 'rotate(-3deg)' },
					'75%': { transform: 'rotate(3deg)' }
				},
				'pulse-glow': {
					'0%, 100%': { 
						transform: 'scale(1)',
						filter: 'brightness(1) drop-shadow(0 0 8px rgba(251, 191, 36, 0.3))'
					},
					'50%': { 
						transform: 'scale(1.02)',
						filter: 'brightness(1.1) drop-shadow(0 0 16px rgba(251, 191, 36, 0.6))'
					}
				},
				'hover-float': {
					'0%, 100%': { transform: 'translateY(0px) scale(1)' },
					'50%': { transform: 'translateY(-3px) scale(1.02)' }
				},
				'stagger-fade': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.9)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'morphing-bg': {
					'0%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' },
					'50%': { borderRadius: '30% 60% 70% 40% / 50% 60% 30% 60%' },
					'100%': { borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }
				},
				'glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(251, 191, 36, 0.3)' },
					'50%': { boxShadow: '0 0 40px rgba(251, 191, 36, 0.6)' }
				},
				'store-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.4)' },
					'50%': { boxShadow: '0 0 30px rgba(59, 130, 246, 0.6)' }
				},
				'community-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(34, 197, 94, 0.4)' },
					'50%': { boxShadow: '0 0 30px rgba(34, 197, 94, 0.6)' }
				},
				'premium-glow': {
					'0%, 100%': { boxShadow: '0 0 20px rgba(147, 51, 234, 0.4)' },
					'50%': { boxShadow: '0 0 30px rgba(147, 51, 234, 0.6)' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'float-enhanced': {
					'0%, 100%': { transform: 'translateY(0px) rotate(0deg)' },
					'33%': { transform: 'translateY(-4px) rotate(1deg)' },
					'66%': { transform: 'translateY(2px) rotate(-1deg)' }
				},
				'notification-glow': {
					'0%, 100%': { 
						transform: 'scale(1)',
						boxShadow: '0 0 0 0 rgba(239, 68, 68, 0.7)'
					},
					'50%': { 
						transform: 'scale(1.05)',
						boxShadow: '0 0 0 10px rgba(239, 68, 68, 0)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'fade-in-up': 'fade-in-up 0.3s ease-out',
				'slide-in-up': 'slide-in-up 0.3s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'slide-in-left': 'slide-in-left 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.4s ease-out',
				'scale-in': 'scale-in 0.3s ease-out',
				'bounce-soft': 'bounce-soft 1s ease-in-out infinite',
				'wiggle': 'wiggle 0.5s ease-in-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'hover-float': 'hover-float 0.6s ease-in-out',
				'stagger-fade': 'stagger-fade 0.4s ease-out',
				'glow': 'glow 2s ease-in-out infinite',
				'store-glow': 'store-glow 2s ease-in-out infinite',
				'community-glow': 'community-glow 2s ease-in-out infinite',
				'premium-glow': 'premium-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2s ease-in-out infinite',
				'float-enhanced': 'float-enhanced 6s ease-in-out infinite',
				'notification-glow': 'notification-glow 2s ease-in-out infinite',
				'morphing-bg': 'morphing-bg 8s ease-in-out infinite'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
