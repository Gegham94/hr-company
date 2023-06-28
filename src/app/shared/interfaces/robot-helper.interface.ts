export interface IRobotHelper {
  content: string | string[];
  navigationItemId: number | null;
  isContentActive: boolean;
  uuid?: string;
  link? : string;
}

export type RobotHelper = IRobotHelper | null;
