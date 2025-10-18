import { MemoryRouter as Router, Routes, Route } from 'react-router';
import { ThemeProvider } from '@/components/theme-provider';
import MainPage from './pages/main';

export default function App() {
	return (
		<ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
			<Router>
				<Routes>
					<Route path="/" element={<MainPage />} />
				</Routes>
			</Router>
		</ThemeProvider>
	);
}
