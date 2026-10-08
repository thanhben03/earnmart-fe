// Activity Tracking Provider Interface & Simulator
// Spec Reference: Section 4 (S09) & Section 12 Rule 7

export interface TrackingState {
  isActive: boolean;
  isPaused: boolean;
  distanceMeters: number;
  durationSeconds: number;
  currentPaceSecPerKm: number; // seconds per km
  caloriesEstimated: number;
  mode: 'WALK' | 'RUN';
}

export interface IActivityTrackingProvider {
  requestPermissions(): Promise<boolean>;
  startTracking(mode: 'WALK' | 'RUN', onUpdate: (state: TrackingState) => void): void;
  pauseTracking(): void;
  resumeTracking(): void;
  stopTracking(): Promise<TrackingState>;
  isSimulated(): boolean;
}

export class SimulatedActivityTracker implements IActivityTrackingProvider {
  private timer: any = null;
  private state: TrackingState = {
    isActive: false,
    isPaused: false,
    distanceMeters: 0,
    durationSeconds: 0,
    currentPaceSecPerKm: 600,
    caloriesEstimated: 0,
    mode: 'WALK',
  };
  private listener: ((state: TrackingState) => void) | null = null;

  async requestPermissions(): Promise<boolean> {
    // Simulated permission grant
    return true;
  }

  isSimulated(): boolean {
    return true;
  }

  startTracking(mode: 'WALK' | 'RUN', onUpdate: (state: TrackingState) => void): void {
    this.listener = onUpdate;
    this.state = {
      isActive: true,
      isPaused: false,
      distanceMeters: 0,
      durationSeconds: 0,
      currentPaceSecPerKm: mode === 'RUN' ? 360 : 600,
      caloriesEstimated: 0,
      mode,
    };

    if (this.timer) clearInterval(this.timer);

    // Increment distance realistically every second
    const metersPerSec = mode === 'RUN' ? 2.8 : 1.4; // ~10 km/h run, ~5 km/h walk
    const calPerSec = mode === 'RUN' ? 0.18 : 0.08;

    this.timer = setInterval(() => {
      if (!this.state.isActive || this.state.isPaused) return;

      this.state.durationSeconds += 1;
      this.state.distanceMeters += metersPerSec;
      this.state.caloriesEstimated += calPerSec;

      if (this.listener) {
        this.listener({ ...this.state });
      }
    }, 1000);

    this.listener({ ...this.state });
  }

  pauseTracking(): void {
    this.state.isPaused = true;
    if (this.listener) this.listener({ ...this.state });
  }

  resumeTracking(): void {
    this.state.isPaused = false;
    if (this.listener) this.listener({ ...this.state });
  }

  async stopTracking(): Promise<TrackingState> {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    const finalState = { ...this.state, isActive: false, isPaused: false };
    this.state = finalState;
    if (this.listener) this.listener(finalState);
    return finalState;
  }

  // Debug helper to advance distance for quick testing
  simulateJump(meters: number): void {
    if (!this.state.isActive) return;
    this.state.distanceMeters += meters;
    this.state.durationSeconds += Math.floor(meters / 2);
    this.state.caloriesEstimated += meters * 0.05;
    if (this.listener) this.listener({ ...this.state });
  }
}

export const activityTracker = new SimulatedActivityTracker();

