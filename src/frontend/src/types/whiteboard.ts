export type Point = { x: number; y: number };

export type BaseElement = {
  id: string;
  type: "rect" | "ellipse" | "arrow" | "text" | "code";
  position: Point;
  rotation?: number;
  width?: number;
  height?: number;
  groupId?: string;
  createdAt: number;
  updatedAt: number;
  selected?: boolean;
  open?: boolean;
};

export type RectElement = BaseElement & {
  type: "rect";
  fill?: string;
  stroke?: string;
};

export type EllipseElement = BaseElement & {
  type: "ellipse";
  fill?: string;
  stroke?: string;
};

export type ArrowElement = BaseElement & {
  type: "arrow";
  points: number[]; // [x1,y1,x2,y2]
  stroke?: string;
};

export type TextElement = BaseElement & {
  type: "text";
  text: string;
  fontSize?: number;
  align?: "left" | "center" | "right";
};

export type CodeElement = BaseElement & {
  type: "code";
  language: string;
  code: string;
};

export type WhiteboardElement =
  | RectElement
  | EllipseElement
  | ArrowElement
  | TextElement
  | CodeElement;

export type WhiteboardDocument = {
  id: string;
  title: string;
  elements: WhiteboardElement[];
  viewport: {
    x: number;
    y: number;
    scale: number;
  };
  updatedAt: number;
};

export type Tool =
  | "select"
  | "pan"
  | "rect"
  | "ellipse"
  | "arrow"
  | "text"
  | "code";

// New element payloads (without generated fields)
export type NewRectElement = Omit<RectElement, "id" | "createdAt" | "updatedAt">;
export type NewEllipseElement = Omit<EllipseElement, "id" | "createdAt" | "updatedAt">;
export type NewArrowElement = Omit<ArrowElement, "id" | "createdAt" | "updatedAt">;
export type NewTextElement = Omit<TextElement, "id" | "createdAt" | "updatedAt">;
export type NewCodeElement = Omit<CodeElement, "id" | "createdAt" | "updatedAt">;
export type NewElementInput =
  | NewRectElement
  | NewEllipseElement
  | NewArrowElement
  | NewTextElement
  | NewCodeElement;


