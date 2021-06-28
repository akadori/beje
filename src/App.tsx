import React, { useState, useEffect, useRef, MutableRefObject } from "react";
function App() {
  type Point = {
    x: number;
    y: number;
  };
  type Line = {
    start: Point;
    end: Point;
  };
  const canvasLine = useRef<HTMLCanvasElement>(null);
  const canvasPoint = useRef<HTMLCanvasElement>(null);
  const [points, setPoints] = useState<Point[]>([]);
  const [dimensions, setDimensions] = useState({
    height: window.innerHeight,
    width: window.innerWidth,
  });
  const INITIAL = 600;
  const [timeLeft, setTimeLeft] = useState<number>(INITIAL);
  useEffect(() => {
    const timeId = setInterval(
      () => setTimeLeft((tl) => (tl === 0 ? INITIAL : tl - 1)),
      10
    );
    return () => clearInterval(timeId);
  }, []);

  const connectPoints = (points: Point[]): Line[] => {
    return points.reduce((lines: Line[], p, index, array) => {
      return index > 0
        ? [...lines, { start: array[index - 1], end: p }]
        : lines;
    }, []);
  };

  useEffect(() => {
    const ctx = canvasPoint.current!.getContext("2d")!;
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
  }, [points]);

  const pointsOnLines = (lines: Line[], t: number) => {
    return lines.map((l) => {
      const { start, end } = l;
      return {
        x: start.x + (end.x - start.x) * t,
        y: start.y + (end.y - start.y) * t,
      };
    });
  };

  const pointsAndLines = (clickedPoints: Point[], t: number) => {
    const len = clickedPoints.length;
    const result: { points: Point[]; lines: Line[] } = {
      points: [],
      lines: [],
    };
    let targetPoints = clickedPoints;
    for (let index = 0; index < len; index++) {
      // result.points.push(...targetPoints);
      result.points = targetPoints;
      const lines = connectPoints(targetPoints);
      result.lines.push(...lines);
      targetPoints = pointsOnLines(lines, t);
    }
    return result;
  };

  const drawLine = (lines: Line[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    lines.forEach((l) => {
      ctx.beginPath();
      ctx.moveTo(l.start.x, l.start.y);
      ctx.lineTo(l.end.x, l.end.y);
      ctx.stroke();
    });
  };

  const drawPoints = (points: Point[], canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "green";
    points.forEach((p) => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 1, 0, 360);
      ctx.stroke();
    });
  };

  useEffect(() => {
    if (canvasLine.current && canvasPoint.current) {
      const { points: pointsToDraw, lines } = pointsAndLines(
        points,
        timeLeft / INITIAL
      );
      drawLine(lines, canvasLine.current);
      drawPoints(pointsToDraw, canvasPoint.current);
    }
  }, [points, timeLeft]);

  useEffect(() => {
    function handleResize() {
      setDimensions({
        height: window.innerHeight,
        width: window.innerWidth,
      });
    }

    window.addEventListener("resize", handleResize);
  });

  const onClickHandle = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (canvasPoint.current) {
      setPoints((prevPoints) => [
        ...prevPoints,
        { x: e.clientX, y: e.clientY },
      ]);
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <p>timeleft: {timeLeft}</p>
      <canvas
        {...dimensions}
        style={{ position: "absolute", top: 0, left: 0 }}
        ref={canvasLine}
      ></canvas>
      <canvas
        {...dimensions}
        style={{ position: "absolute", top: 0, left: 0 }}
        ref={canvasPoint}
        onClick={onClickHandle}
      ></canvas>
    </div>
  );
}

export default App;
