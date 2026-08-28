import React, { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material"
import UploadIcon from "@mui/icons-material/Upload"
import CloseIcon from "@mui/icons-material/Close"
import Panzoom, { type PanzoomObject } from "@panzoom/panzoom"
import { useI18n } from "@/i18n"

interface ImageCompareProps {
  leftSrc: string
  rightSrc: string
  leftLabel?: string
  rightLabel?: string
  leftFileSize?: number
  rightFileSize?: number
  onReplaceLeft: () => void
  onReplaceRight: () => void
  onClearLeft: () => void
  onClearRight: () => void
}

interface ImgDim {
  w: number
  h: number
}

function formatFileSize(bytes: number): string {
  if (bytes <= 0) return ""
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

const SLIDER_HIT_ZONE = 24

const ImageCompare: React.FC<ImageCompareProps> = ({
  leftSrc,
  rightSrc,
  leftLabel,
  rightLabel,
  leftFileSize = 0,
  rightFileSize = 0,
  onReplaceLeft,
  onReplaceRight,
  onClearLeft,
  onClearRight,
}) => {
  const { t } = useI18n()
  const containerRef = useRef<HTMLDivElement>(null)
  const sliderLineRef = useRef<HTMLDivElement>(null)
  const panzoomPlaneRef = useRef<HTMLDivElement>(null)
  const panzoomRef = useRef<PanzoomObject | null>(null)

  // Keep comparison-slider state outside React's render cycle.
  const stateRef = useRef({
    sliderPos: 50,
    isDragging: false,
    isPanning: false,
  })
  const rafId = useRef(0)

  // Only these trigger re-renders (for label display)
  const [leftDim, setLeftDim] = useState<ImgDim>({ w: 0, h: 0 })
  const [rightDim, setRightDim] = useState<ImgDim>({ w: 0, h: 0 })
  const [scaleDisplay, setScaleDisplay] = useState(1)

  const displaySize: ImgDim = useMemo(
    () => (rightDim.w > 0 ? rightDim : leftDim.w > 0 ? leftDim : { w: 0, h: 0 }),
    [leftDim, rightDim]
  )

  // DOM refs for direct manipulation (no React re-render on move)
  const rightWrapRef = useRef<HTMLDivElement>(null)
  const leftClipRef = useRef<HTMLDivElement>(null)
  const rightImgRef = useRef<HTMLImageElement>(null)
  const leftImgRef = useRef<HTMLImageElement>(null)

  const applyComparisonPosition = useCallback(() => {
    const s = stateRef.current
    if (leftClipRef.current) {
      leftClipRef.current.style.clipPath = `inset(0 ${100 - s.sliderPos}% 0 0)`
    }
    if (sliderLineRef.current) {
      sliderLineRef.current.style.left = `${s.sliderPos}%`
    }
  }, [])

  const handleLeftLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget
      setLeftDim({ w: img.naturalWidth, h: img.naturalHeight })
    },
    []
  )

  const handleRightLoad = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement>) => {
      const img = e.currentTarget
      setRightDim({ w: img.naturalWidth, h: img.naturalHeight })
    },
    []
  )

  const updateSlider = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const x = clientX - rect.left
      stateRef.current.sliderPos = Math.max(0, Math.min(100, (x / rect.width) * 100))
    },
    []
  )

  const scheduleRaf = useCallback(() => {
    if (rafId.current) return
    rafId.current = requestAnimationFrame(() => {
      rafId.current = 0
      applyComparisonPosition()
    })
  }, [applyComparisonPosition])

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0 && e.button !== 1) return
      const s = stateRef.current

      // Determine if click is near the slider line
      if (containerRef.current && e.button === 0 && !e.altKey) {
        const rect = containerRef.current.getBoundingClientRect()
        const sliderX = rect.left + (s.sliderPos / 100) * rect.width
        const dist = Math.abs(e.clientX - sliderX)

        if (dist < SLIDER_HIT_ZONE) {
          // Near slider → drag slider
          s.isDragging = true
          updateSlider(e.clientX)
          scheduleRaf()
          e.currentTarget.setPointerCapture(e.pointerId)
          e.preventDefault()
          return
        }
      }

      // Otherwise → pan
      s.isPanning = true
      e.currentTarget.setPointerCapture(e.pointerId)
      panzoomRef.current?.handleDown(e.nativeEvent)
    },
    [updateSlider, scheduleRaf]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = stateRef.current
      if (s.isPanning) {
        panzoomRef.current?.handleMove(e.nativeEvent)
        return
      }
      if (s.isDragging) {
        updateSlider(e.clientX)
        scheduleRaf()
      }
    },
    [updateSlider, scheduleRaf]
  )

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    // Always forward pointer completion so multi-touch pointers are cleared.
    panzoomRef.current?.handleUp(e.nativeEvent)
    stateRef.current.isDragging = false
    stateRef.current.isPanning = false
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      panzoomRef.current?.zoomWithWheel(e.nativeEvent)
    },
    []
  )

  // Cursor style: col-resize near slider, grab elsewhere
  const onPointerMovePassive = useCallback(
    (e: React.PointerEvent) => {
      if (stateRef.current.isDragging || stateRef.current.isPanning) {
        onPointerMove(e)
        return
      }
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const sliderX = rect.left + (stateRef.current.sliderPos / 100) * rect.width
      const dist = Math.abs(e.clientX - sliderX)
      containerRef.current.style.cursor = dist < SLIDER_HIT_ZONE ? "col-resize" : "grab"
    },
    [onPointerMove]
  )

  // Panzoom owns the gesture math and keeps the point under the cursor fixed
  // while zooming. Its transform is mirrored to both comparison images.
  useEffect(() => {
    const element = panzoomPlaneRef.current
    if (!element) return

    const panzoom = Panzoom(element, {
      minScale: 0.1,
      maxScale: 20,
      step: 0.3,
      noBind: true,
      pinchAndPan: true,
      setTransform: (target, { x, y, scale }) => {
        const transform = `scale(${scale}) translate(${x}px, ${y}px)`
        const rendering = scale > 2 ? "pixelated" : "auto"

        target.style.transform = transform
        for (const ref of [rightImgRef, leftImgRef]) {
          if (ref.current) {
            ref.current.style.transform = transform
            ref.current.style.imageRendering = rendering
          }
        }
        setScaleDisplay(scale)
      },
    })

    panzoomRef.current = panzoom
    return () => {
      panzoom.destroy()
      panzoom.resetStyle()
      panzoomRef.current = null
    }
  }, [])

  // Reset pan/zoom when images change
  useEffect(() => {
    const s = stateRef.current
    s.sliderPos = 50
    panzoomRef.current?.reset({ animate: false })
    setScaleDisplay(1)
    setLeftDim({ w: 0, h: 0 })
    setRightDim({ w: 0, h: 0 })
    // Apply after reset
    requestAnimationFrame(() => applyComparisonPosition())
  }, [leftSrc, rightSrc, applyComparisonPosition])

  // Set initial size on display images once displaySize is known
  useEffect(() => {
    if (displaySize.w > 0) {
      for (const ref of [rightImgRef, leftImgRef]) {
        if (ref.current) {
          ref.current.style.width = `${displaySize.w}px`
          ref.current.style.height = `${displaySize.h}px`
        }
      }
    }
  }, [displaySize])

  const leftInfo = useMemo(() => {
    const parts: string[] = []
    if (leftDim.w > 0) parts.push(`${leftDim.w}×${leftDim.h}`)
    if (leftFileSize > 0) parts.push(formatFileSize(leftFileSize))
    return parts.length ? ` (${parts.join(" · ")})` : ""
  }, [leftDim, leftFileSize])

  const rightInfo = useMemo(() => {
    const parts: string[] = []
    if (rightDim.w > 0) parts.push(`${rightDim.w}×${rightDim.h}`)
    if (rightFileSize > 0) parts.push(formatFileSize(rightFileSize))
    return parts.length ? ` (${parts.join(" · ")})` : ""
  }, [rightDim, rightFileSize])

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%", minHeight: 0, display: "flex", flexDirection: "column" }}>
      {/* Zoom info bar */}
      <Paper
        elevation={0}
        sx={{
          position: "absolute",
          top: 12,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 20,
          px: 1.5,
          py: 0.5,
          bgcolor: "rgba(30,37,40,0.72)",
          color: "#fff",
          pointerEvents: "none",
          userSelect: "none",
        }}
      >
        <Typography variant="caption">{Math.round(scaleDisplay * 100)}% · {t("zoomTip")}</Typography>
      </Paper>

      {/* Labels */}
      <ImageLabel
        align="left"
        label={leftLabel || t("beforeLabel")}
        info={leftInfo}
        onReplace={onReplaceLeft}
        onClear={onClearLeft}
      />
      <ImageLabel
        align="right"
        label={rightLabel || t("afterLabel")}
        info={rightInfo}
        onReplace={onReplaceRight}
        onClear={onClearRight}
      />

      {/* Comparison viewport */}
      <Box
        ref={containerRef}
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          userSelect: "none",
          bgcolor: "#1a1f22",
        }}
        style={{ touchAction: "none", cursor: "grab" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMovePassive}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={onWheel}
      >
        {/* Full-size gesture plane gives Panzoom a stable viewport coordinate system. */}
        <Box
          ref={panzoomPlaneRef}
          aria-hidden="true"
          sx={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        />

        {/* Right image (full, bottom layer) */}
        <Box ref={rightWrapRef} sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Box
            component="img"
            ref={rightImgRef}
            src={rightSrc}
            alt="Right"
            draggable={false}
            onLoad={handleRightLoad}
            sx={{ maxWidth: "none", pointerEvents: "none", willChange: "transform" }}
            style={{ transformOrigin: "center center" }}
          />
        </Box>

        {/* Left image (clipped) — stretched to match right image size */}
        <Box
          ref={leftClipRef}
          sx={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          style={{ clipPath: "inset(0 50% 0 0)" }}
        >
          <Box
            component="img"
            ref={leftImgRef}
            src={leftSrc}
            alt="Left"
            draggable={false}
            onLoad={handleLeftLoad}
            sx={{ maxWidth: "none", pointerEvents: "none", willChange: "transform" }}
            style={{ transformOrigin: "center center" }}
          />
        </Box>

        {/* Slider line */}
        <Box
          ref={sliderLineRef}
          sx={{ position: "absolute", top: 0, bottom: 0, zIndex: 10, pointerEvents: "none" }}
          style={{ left: "50%" }}
        >
          <Box sx={{ position: "absolute", top: 0, bottom: 0, transform: "translateX(-50%)", width: "2px", bgcolor: "#fff", boxShadow: "0 0 4px rgba(0,0,0,0.5)" }} />
          {/* Handle */}
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: 0,
              transform: "translate(-50%, -50%)",
              width: 32,
              height: 32,
              borderRadius: "50%",
              bgcolor: "#fff",
              boxShadow: 3,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#52525b",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M5 3L2 8L5 13M11 3L14 8L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

interface ImageLabelProps {
  align: "left" | "right"
  label: string
  info: string
  onReplace: () => void
  onClear: () => void
}

function ImageLabel({
  align,
  label,
  info,
  onReplace,
  onClear,
}: ImageLabelProps) {
  const { t } = useI18n()

  return (
    <Paper
      elevation={0}
      sx={{
        position: "absolute",
        top: 12,
        zIndex: 20,
        maxWidth: "calc(50% - 1rem)",
        left: align === "left" ? 12 : "auto",
        right: align === "right" ? 12 : "auto",
        bgcolor: "rgba(30,37,40,0.72)",
        color: "#fff",
      }}
    >
      <Stack direction="row" spacing={1} sx={{ px: 1, py: 0.5, alignItems: "center" }}>
        <Box sx={{ minWidth: 0, userSelect: "none" }}>
          <Typography variant="caption" noWrap sx={{ display: "block" }}>
            {label}
            {info}
          </Typography>
        </Box>
        <Stack direction="row" spacing={0.25} sx={{ flexShrink: 0 }}>
          <Tooltip title={t("replace")}>
            <IconButton
              size="small"
              aria-label={t("replace")}
              sx={{ color: "rgba(255,255,255,0.78)", p: 0.35 }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onReplace()
              }}
            >
              <UploadIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={t("remove")}>
            <IconButton
              size="small"
              aria-label={t("remove")}
              sx={{ color: "rgba(255,255,255,0.78)", p: 0.35, '&:hover': { color: "#fca5a5" } }}
              onPointerDown={(e) => e.stopPropagation()}
              onClick={(e) => {
                e.stopPropagation()
                onClear()
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>
    </Paper>
  )
}

export default React.memo(ImageCompare)
