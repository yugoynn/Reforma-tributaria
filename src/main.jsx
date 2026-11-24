import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './associacao.css';

// Sem StrictMode: os motores legados (public/legacy/js) ligam eventos direto no DOM
// e devem rodar uma única vez sobre a marcação montada pelo React.
createRoot(document.getElementById('root')).render(<App />);
