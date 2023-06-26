export interface RobotHelperInterface {
  content: string | string[];
  navigationItemId: number | null;
  isContentActive: boolean;
  uuid?: string;
  link? : string;
}

export type RobotHelper = RobotHelperInterface | null;
