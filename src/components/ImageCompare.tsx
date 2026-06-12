import React, { useRef, useState, useCallback, useEffect, useMemo } from "react"
import { Box, IconButton, Paper, Stack, Tooltip, Typography } from "@mui/material"
import UploadIcon from "@mui/icons-material/Upload"
import CloseIcon from "@mui/icons-material/Close"
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

  // Use refs for high-frequency mutable state to avoid re-renders
  const stateRef = useRef({
    sliderPos: 50,
    scale: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    isPanning: false,
    panStartX: 0,
    panStartY: 0,
    panOffsetX: 0,
    panOffsetY: 0,
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

  const applyTransform = useCallback(() => {
    const s = stateRef.current
    const transform = `translate(${s.panX}px, ${s.panY}px) scale(${s.scale})`
    const rendering = s.scale > 2 ? "pixelated" : "auto"

    if (rightImgRef.current) {
      rightImgRef.current.style.transform = transform
      rightImgRef.current.style.imageRendering = rendering
    }
    if (leftImgRef.current) {
      leftImgRef.current.style.transform = transform
      leftImgRef.current.style.imageRendering = rendering
    }
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
      applyTransform()
    })
  }, [applyTransform])

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
      s.panStartX = e.clientX
      s.panStartY = e.clientY
      s.panOffsetX = s.panX
      s.panOffsetY = s.panY
      e.currentTarget.setPointerCapture(e.pointerId)
      e.preventDefault()
    },
    [updateSlider, scheduleRaf]
  )

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const s = stateRef.current
      if (s.isPanning) {
        s.panX = s.panOffsetX + (e.clientX - s.panStartX)
        s.panY = s.panOffsetY + (e.clientY - s.panStartY)
        scheduleRaf()
        return
      }
      if (s.isDragging) {
        updateSlider(e.clientX)
        scheduleRaf()
      }
    },
    [updateSlider, scheduleRaf]
  )

  const onPointerUp = useCallback(() => {
    stateRef.current.isDragging = false
    stateRef.current.isPanning = false
  }, [])

  const onWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault()
      const s = stateRef.current
      const factor = e.deltaY > 0 ? 0.9 : 1.1
      s.scale = Math.max(0.1, Math.min(20, s.scale * factor))
      setScaleDisplay(s.scale)
      scheduleRaf()
    },
    [scheduleRaf]
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

  // Reset pan/zoom when images change
  useEffect(() => {
    const s = stateRef.current
    s.scale = 1
    s.panX = 0
    s.panY = 0
    s.sliderPos = 50
    setScaleDisplay(1)
    setLeftDim({ w: 0, h: 0 })
    setRightDim({ w: 0, h: 0 })
    // Apply after reset
    requestAnimationFrame(() => applyTransform())
  }, [leftSrc, rightSrc, applyTransform])

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
        onWheel={onWheel}
      >
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
