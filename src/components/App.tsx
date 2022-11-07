import { installer } from '../utils';
import Canvas from './Canvas';

export default function App() {
  return <Canvas width={1920} height={1080} onMount={installer} />;
}
