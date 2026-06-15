import { useEffect } from 'react'

/**
 * Custom hook that enables smooth scrolling to anchor sections
 * when clicking navigation links with href starting with '#'.
 * Attaches a global click listener and cleans up on unmount.
 */
export function useScrollToSection() {
    useEffect(() => {
        const handleNavClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement
            const href = target.getAttribute('href')
            if (!href || !href.startsWith('#')) return

            e.preventDefault()
            const element = document.querySelector(href)
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' })
            }
        }

        document.addEventListener('click', handleNavClick)
        return () => document.removeEventListener('click', handleNavClick)
    }, [])
}
