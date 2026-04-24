import { Component, ReactNode } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { Board } from './components/Board';
import './index.css';

class ErrorBoundary extends Component<{ children: ReactNode }, { error: string | null }> {
  state = { error: null };
  static getDerivedStateFromError(e: Error) { return { error: e.message }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, color: 'red', fontFamily: 'monospace' }}>
          <h2>Something went wrong:</h2>
          <pre>{this.state.error}</pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Board />
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
