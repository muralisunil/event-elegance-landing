interface Point {
  x: number;
  y: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Obstruction {
  position_data: string;
  dimensions: string | null;
}

/**
 * Calculates the stage visibility percentage from a seating element's position
 * accounting for obstructions (pillars) that may block the view
 */
export class StageVisibilityCalculator {
  private hallWidth: number;
  private hallLength: number;
  private stagePosition: string | null;
  private hasStage: boolean;
  private obstructions: Obstruction[];
  private scaleFactor: number;

  constructor(
    hallWidth: number,
    hallLength: number,
    stagePosition: string | null,
    hasStage: boolean,
    obstructions: Obstruction[] = [],
    scaleFactor: number = 5
  ) {
    this.hallWidth = hallWidth;
    this.hallLength = hallLength;
    this.stagePosition = stagePosition;
    this.hasStage = hasStage;
    this.obstructions = obstructions;
    this.scaleFactor = scaleFactor;
  }

  /**
   * Get the stage rectangle based on position
   */
  private getStageRectangle(): Rectangle | null {
    if (!this.hasStage || !this.stagePosition) return null;

    const canvasWidth = this.hallLength * this.scaleFactor;
    const canvasHeight = this.hallWidth * this.scaleFactor;
    const stageDepth = 60; // Stage depth in pixels
    const stageWidth = Math.min(canvasWidth * 0.6, 300); // 60% of width or max 300px

    switch (this.stagePosition) {
      case 'front':
        return {
          x: (canvasWidth - stageWidth) / 2,
          y: 10,
          width: stageWidth,
          height: stageDepth,
        };
      case 'back':
        return {
          x: (canvasWidth - stageWidth) / 2,
          y: canvasHeight - stageDepth - 10,
          width: stageWidth,
          height: stageDepth,
        };
      case 'left':
        return {
          x: 10,
          y: (canvasHeight - stageWidth) / 2,
          width: stageDepth,
          height: stageWidth,
        };
      case 'right':
        return {
          x: canvasWidth - stageDepth - 10,
          y: (canvasHeight - stageWidth) / 2,
          width: stageDepth,
          height: stageWidth,
        };
      default:
        return null;
    }
  }

  /**
   * Parse obstruction rectangles from JSON data
   */
  private getObstructionRectangles(): Rectangle[] {
    return this.obstructions
      .map((obs) => {
        try {
          const position = JSON.parse(obs.position_data);
          const dimensions = obs.dimensions ? JSON.parse(obs.dimensions) : null;

          if (!dimensions) return null;

          return {
            x: (position.x || 0) * this.scaleFactor,
            y: (position.y || 0) * this.scaleFactor,
            width: (dimensions.width || 20) * this.scaleFactor,
            height: (dimensions.height || 20) * this.scaleFactor,
          };
        } catch (error) {
          console.error('Error parsing obstruction:', error);
          return null;
        }
      })
      .filter((rect): rect is Rectangle => rect !== null);
  }

  /**
   * Check if a line segment intersects with a rectangle (obstruction)
   */
  private lineIntersectsRectangle(
    p1: Point,
    p2: Point,
    rect: Rectangle
  ): boolean {
    // Check if line intersects with any of the four edges of the rectangle
    const edges = [
      { p1: { x: rect.x, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y } },
      { p1: { x: rect.x + rect.width, y: rect.y }, p2: { x: rect.x + rect.width, y: rect.y + rect.height } },
      { p1: { x: rect.x + rect.width, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y + rect.height } },
      { p1: { x: rect.x, y: rect.y + rect.height }, p2: { x: rect.x, y: rect.y } },
    ];

    return edges.some((edge) => this.linesIntersect(p1, p2, edge.p1, edge.p2));
  }

  /**
   * Check if two line segments intersect
   */
  private linesIntersect(p1: Point, p2: Point, p3: Point, p4: Point): boolean {
    const det = (p2.x - p1.x) * (p4.y - p3.y) - (p4.x - p3.x) * (p2.y - p1.y);
    if (det === 0) return false;

    const lambda = ((p4.y - p3.y) * (p4.x - p1.x) + (p3.x - p4.x) * (p4.y - p1.y)) / det;
    const gamma = ((p1.y - p2.y) * (p4.x - p1.x) + (p2.x - p1.x) * (p4.y - p1.y)) / det;

    return lambda > 0 && lambda < 1 && gamma > 0 && gamma < 1;
  }

  /**
   * Calculate visibility percentage from a seating element to the stage
   * Returns a value between 0-100 representing the percentage of stage visible
   */
  calculateVisibility(elementX: number, elementY: number, elementWidth: number = 80, elementHeight: number = 80): number {
    const stage = this.getStageRectangle();
    if (!stage) return 100; // If no stage, visibility is not applicable

    const obstructionRects = this.getObstructionRectangles();
    if (obstructionRects.length === 0) return 100; // No obstructions, full visibility

    // Calculate center of the seating element
    const seatCenter: Point = {
      x: elementX + elementWidth / 2,
      y: elementY + elementHeight / 2,
    };

    // Sample multiple points on the stage to determine visibility
    const samplePoints: Point[] = [];
    const samplesPerSide = 5;
    for (let i = 0; i < samplesPerSide; i++) {
      for (let j = 0; j < samplesPerSide; j++) {
        samplePoints.push({
          x: stage.x + (stage.width * i) / (samplesPerSide - 1),
          y: stage.y + (stage.height * j) / (samplesPerSide - 1),
        });
      }
    }

    // Check how many sample points are visible (not blocked by obstructions)
    let visiblePoints = 0;
    for (const point of samplePoints) {
      let blocked = false;
      for (const obstruction of obstructionRects) {
        if (this.lineIntersectsRectangle(seatCenter, point, obstruction)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) visiblePoints++;
    }

    // Calculate percentage
    return Math.round((visiblePoints / samplePoints.length) * 100);
  }

  /**
   * Get a color representing the visibility percentage
   */
  static getVisibilityColor(percentage: number): string {
    if (percentage >= 80) return 'hsl(var(--chart-2))'; // Good visibility - green
    if (percentage >= 50) return 'hsl(var(--chart-3))'; // Moderate visibility - yellow
    return 'hsl(var(--destructive))'; // Poor visibility - red
  }

  /**
   * Get visibility quality label
   */
  static getVisibilityLabel(percentage: number): string {
    if (percentage >= 80) return 'Excellent';
    if (percentage >= 50) return 'Good';
    if (percentage >= 30) return 'Limited';
    return 'Poor';
  }
}
