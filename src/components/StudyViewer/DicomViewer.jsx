import React, { useRef, useEffect, useState } from "react";
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Square,
  Ruler,
  Contrast,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

const DicomViewer = ({ series, selectedImage, onImageSelect, patient }) => {
  const canvasRef = useRef(null);
  const [currentTool, setCurrentTool] = useState("pan");
  const [isPlaying, setIsPlaying] = useState(false);
  const [windowLevel, setWindowLevel] = useState(50);
  const [windowWidth, setWindowWidth] = useState(100);
  const [zoom, setZoom] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [imageProperties, setImageProperties] = useState({});
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (series && canvasRef.current) {
      loadAndDisplayImage();
    }
  }, [
    series,
    selectedImage,
    zoom,
    rotation,
    windowLevel,
    windowWidth,
    panOffset,
  ]);

  const loadAndDisplayImage = () => {
    if (!series || !series.images || series.images.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const currentImageData = series.images[selectedImage];

    // For demo purposes, we'll simulate loading a DICOM image
    // In a real implementation, you'd use cornerstone.js or similar
    const img = new Image();
    img.onload = () => {
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Calculate centered position with pan offset
      const centerX = canvas.width / 2 + panOffset.x;
      const centerY = canvas.height / 2 + panOffset.y;

      // Save context for transformations
      ctx.save();

      // Apply transformations
      ctx.translate(centerX, centerY);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      // Apply window/level adjustments (simplified)
      ctx.filter = `brightness(${windowLevel}%) contrast(${windowWidth}%)`;

      // Draw image
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      // Restore context
      ctx.restore();

      // Update image properties
      setImageProperties({
        width: img.width,
        height: img.height,
        pixelSpacing: currentImageData.pixelSpacing || "1.0\\1.0",
        sliceThickness: currentImageData.sliceThickness || "5.0",
        instanceNumber: currentImageData.instanceNumber || selectedImage + 1,
      });
    };

    // Use placeholder image for demo - replace with actual DICOM loading
    img.src =
      currentImageData.imageUrl ||
      `/api/placeholder/512/512?text=Slice+${selectedImage + 1}`;
  };

  const handleToolSelect = (tool) => {
    setCurrentTool(tool);
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev * 1.2, 5.0));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev / 1.2, 0.1));
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleReset = () => {
    setZoom(1.0);
    setRotation(0);
    setWindowLevel(50);
    setWindowWidth(100);
    setPanOffset({ x: 0, y: 0 });
  };

  const handlePreviousImage = () => {
    if (series && selectedImage > 0) {
      onImageSelect(selectedImage - 1);
    }
  };

  const handleNextImage = () => {
    if (series && selectedImage < series.images.length - 1) {
      onImageSelect(selectedImage + 1);
    }
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
    // TODO: Implement actual playback logic
    if (!isPlaying) {
      // Start auto-advancing through images
      console.log("Starting playback...");
    } else {
      // Stop playback
      console.log("Stopping playback...");
    }
  };

  const handleCanvasMouseWheel = (e) => {
    e.preventDefault();

    if (currentTool === "zoom") {
      if (e.deltaY < 0) {
        handleZoomIn();
      } else {
        handleZoomOut();
      }
    } else {
      // Scroll through images
      if (e.deltaY < 0) {
        handlePreviousImage();
      } else {
        handleNextImage();
      }
    }
  };

  const handleCanvasMouseDown = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDragging(true);
    setLastMousePos({ x, y });
  };

  const handleCanvasMouseMove = (e) => {
    if (!isDragging) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (currentTool === "pan") {
      const deltaX = x - lastMousePos.x;
      const deltaY = y - lastMousePos.y;

      setPanOffset((prev) => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY,
      }));
    } else if (currentTool === "windowing") {
      const deltaX = x - lastMousePos.x;
      const deltaY = y - lastMousePos.y;

      // Adjust window level and width based on mouse movement
      setWindowLevel((prev) => Math.max(0, Math.min(100, prev + deltaY * 0.5)));
      setWindowWidth((prev) => Math.max(1, Math.min(200, prev + deltaX * 0.5)));
    }

    setLastMousePos({ x, y });
  };

  const handleCanvasMouseUp = () => {
    setIsDragging(false);
  };

  const getCursorStyle = () => {
    switch (currentTool) {
      case "pan":
        return "move";
      case "zoom":
        return "zoom-in";
      case "windowing":
        return "crosshair";
      case "measure":
        return "crosshair";
      case "rectangle":
        return "crosshair";
      default:
        return "default";
    }
  };

  if (!series) {
    return (
      <div className="dicom-viewer-placeholder">
        <p>Select a series to view images</p>
      </div>
    );
  }

  const currentImageCount = series.images?.length || 0;

  return (
    <div className="dicom-viewer">
      <div className="dicom-toolbar">
        <div className="tool-group">
          <button
            className={currentTool === "pan" ? "active" : ""}
            onClick={() => handleToolSelect("pan")}
            title="Pan"
          >
            <Move size={18} />
          </button>
          <button
            className={currentTool === "zoom" ? "active" : ""}
            onClick={() => handleToolSelect("zoom")}
            title="Zoom"
          >
            <ZoomIn size={18} />
          </button>
          <button
            className={currentTool === "windowing" ? "active" : ""}
            onClick={() => handleToolSelect("windowing")}
            title="Window/Level"
          >
            <Contrast size={18} />
          </button>
          <button
            className={currentTool === "measure" ? "active" : ""}
            onClick={() => handleToolSelect("measure")}
            title="Measure"
          >
            <Ruler size={18} />
          </button>
          <button
            className={currentTool === "rectangle" ? "active" : ""}
            onClick={() => handleToolSelect("rectangle")}
            title="Rectangle ROI"
          >
            <Square size={18} />
          </button>
        </div>

        <div className="tool-group">
          <button onClick={handleZoomIn} title="Zoom In">
            <ZoomIn size={18} />
          </button>
          <button onClick={handleZoomOut} title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <button onClick={handleRotate} title="Rotate">
            <RotateCw size={18} />
          </button>
          <button onClick={handleReset} title="Reset">
            Reset
          </button>
        </div>

        <div className="windowing-controls">
          <div className="control-group">
            <label>WL:</label>
            <input
              type="range"
              min="0"
              max="100"
              value={windowLevel}
              onChange={(e) => setWindowLevel(e.target.value)}
            />
            <span>{Math.round(windowLevel)}</span>
          </div>
          <div className="control-group">
            <label>WW:</label>
            <input
              type="range"
              min="1"
              max="200"
              value={windowWidth}
              onChange={(e) => setWindowWidth(e.target.value)}
            />
            <span>{Math.round(windowWidth)}</span>
          </div>
        </div>
      </div>

      <div className="dicom-viewer-main">
        <div className="image-navigation">
          <button
            onClick={handlePreviousImage}
            disabled={selectedImage === 0}
            title="Previous Image"
          >
            <ChevronLeft size={20} />
          </button>

          <div className="image-controls">
            <button
              onClick={togglePlayback}
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <span className="image-counter">
              {selectedImage + 1} / {currentImageCount}
            </span>
          </div>

          <button
            onClick={handleNextImage}
            disabled={selectedImage === currentImageCount - 1}
            title="Next Image"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="image-container">
          <canvas
            ref={canvasRef}
            width="512"
            height="512"
            className="dicom-canvas"
            style={{ cursor: getCursorStyle() }}
            onWheel={handleCanvasMouseWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          />

          <div className="image-overlay">
            <div className="overlay-top-left">
              <div>{patient?.name}</div>
              <div>ID: {patient?.patientId}</div>
              <div>{patient?.modality}</div>
              <div>{new Date(patient?.studyDate).toLocaleDateString()}</div>
            </div>

            <div className="overlay-top-right">
              <div>Zoom: {(zoom * 100).toFixed(0)}%</div>
              <div>
                WL/WW: {Math.round(windowLevel)}/{Math.round(windowWidth)}
              </div>
              <div>Rotation: {rotation}°</div>
            </div>

            <div className="overlay-bottom-left">
              <div>Series: {series?.seriesNumber || "N/A"}</div>
              <div>Image: {imageProperties.instanceNumber || "N/A"}</div>
              <div>{series?.description || "No description"}</div>
            </div>

            <div className="overlay-bottom-right">
              <div>
                {imageProperties.width || 512}x{imageProperties.height || 512}
              </div>
              <div>Spacing: {imageProperties.pixelSpacing || "N/A"}</div>
              <div>Thickness: {imageProperties.sliceThickness || "N/A"}mm</div>
            </div>
          </div>
        </div>

        <div className="image-slider-container">
          <input
            type="range"
            min="0"
            max={Math.max(0, currentImageCount - 1)}
            value={selectedImage}
            onChange={(e) => onImageSelect(parseInt(e.target.value))}
            className="image-slider"
          />
        </div>
      </div>
    </div>
  );
};

export default DicomViewer;
