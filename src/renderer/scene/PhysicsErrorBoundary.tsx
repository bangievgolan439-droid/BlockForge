import { Component, type ReactNode } from 'react';
import { useAppStore } from '../state/appStore';

interface Props {
  children: ReactNode;
  fallback: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Physics Sandbox depends on the Rapier WASM module. If it fails to load or throws
 * mid-simulation, this keeps the crash from taking down the whole 3D view — it falls
 * back to the normal voxel world and flips physics back off.
 */
export default class PhysicsErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.error('Physics Sandbox crashed, falling back to Build mode:', error);
    // Flips the store, which unmounts this boundary (SceneRoot swaps back to <VoxelWorld/>
    // once physicsActive is false), so there's no need to reset local state here.
    useAppStore.setState({ physicsActive: false });
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
