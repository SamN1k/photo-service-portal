import { useTheme } from '../context/useTheme';

interface ThemeToggleProps {
    className?: string;
}

export const ThemeToggle = ({ className = '' }: ThemeToggleProps) => {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            type="button"
            onClick={toggleTheme}
            className={`theme-toggle ${className}`}
            aria-label={isDark ? 'Activeaza tema light' : 'Activeaza tema dark'}
            title={isDark ? 'Tema light' : 'Tema dark'}
        >
            <span className={isDark ? 'theme-toggle-sun' : 'theme-toggle-moon'} aria-hidden="true" />
        </button>
    );
};
