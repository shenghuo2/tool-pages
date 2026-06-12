import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  AppBar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  CssBaseline,
  IconButton,
  Paper,
  Stack,
  ThemeProvider,
  Toolbar,
  Typography,
  createTheme,
} from "@mui/material"
import ImageCompare from "@/components/ImageCompare"
import UploadIcon from "@mui/icons-material/Upload"
import ImageIcon from "@mui/icons-material/Image"
import CloseIcon from "@mui/icons-material/Close"
import RestartAltIcon from "@mui/icons-material/RestartAlt"
import TranslateIcon from "@mui/icons-material/Translate"
import { useI18n } from "@/i18n"

type ImageSide = "left" | "right"

interface ImageData {
  url: string
  name: string
  fileSize: number
}

const theme = createTheme({
  palette: {
    mode: "light",
    background: {
      default: "#f7f8f5",
      paper: "#ffffff",
    },
    primary: {
      main: "#415d60",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#d45d4f",
    },
    text: {
      primary: "#1e2528",
      secondary: "#5f7073",
    },
    divider: "#dfe4df",
  },
  shape: {
    borderRadius: 8,
  },
  typography: {
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    button: {
      fontWeight: 700,
      textTransform: "none",
      letterSpacing: 0,
    },
  },
})

function App() {
  const { t, lang, setLang } = useI18n()
  const [leftImage, setLeftImage] = useState<ImageData | null>(null)
  const [rightImage, setRightImage] = useState<ImageData | null>(null)
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)
  const leftImageRef = useRef<ImageData | null>(null)
  const rightImageRef = useRef<ImageData | null>(null)

  const loadImage = useCallback((file: File, side: ImageSide) => {
    const url = URL.createObjectURL(file)
    const extension = file.type.split("/")[1] ?? "png"
    const data: ImageData = {
      url,
      name: file.name || `pasted-image.${extension}`,
      fileSize: file.size,
    }
    if (side === "left") {
      setLeftImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return data
      })
      return
    }

    setRightImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return data
    })
  }, [])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>, side: ImageSide) => {
      const file = e.target.files?.[0]
      if (file) loadImage(file, side)
      e.target.value = ""
    },
    [loadImage]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent, side: ImageSide) => {
      e.preventDefault()
      e.stopPropagation()
      const file = e.dataTransfer.files?.[0]
      if (file && file.type.startsWith("image/")) {
        loadImage(file, side)
      }
    },
    [loadImage]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const clearImage = useCallback((side: ImageSide) => {
    if (side === "left") {
      setLeftImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.url)
        return null
      })
      return
    }

    setRightImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.url)
      return null
    })
  }, [])

  const clearImages = useCallback(() => {
    clearImage("left")
    clearImage("right")
  }, [clearImage])

  const openFilePicker = useCallback((side: ImageSide) => {
    if (side === "left") {
      leftInputRef.current?.click()
      return
    }

    rightInputRef.current?.click()
  }, [])

  const toggleLang = useCallback(() => {
    setLang(lang === "en" ? "zh" : "en")
  }, [lang, setLang])

  useEffect(() => {
    leftImageRef.current = leftImage
  }, [leftImage])

  useEffect(() => {
    rightImageRef.current = rightImage
  }, [rightImage])

  useEffect(() => {
    const handlePaste = (event: ClipboardEvent) => {
      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) => item.type.startsWith("image/"))
      const file = imageItem?.getAsFile()
      if (!file) return
      event.preventDefault()
      loadImage(file, leftImage ? "right" : "left")
    }

    window.addEventListener("paste", handlePaste)
    return () => window.removeEventListener("paste", handlePaste)
  }, [leftImage, loadImage])

  useEffect(() => {
    return () => {
      if (leftImageRef.current) URL.revokeObjectURL(leftImageRef.current.url)
      if (rightImageRef.current) URL.revokeObjectURL(rightImageRef.current.url)
    }
  }, [])

  const bothLoaded = leftImage && rightImage

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ height: "100vh", bgcolor: "background.default", color: "text.primary", display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <AppBar position="sticky" elevation={0} color="inherit" sx={{ borderBottom: 1, borderColor: "divider" }}>
          <Toolbar sx={{ minHeight: 64, gap: 1.5 }}>
            <ImageIcon color="primary" />
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 800 }}>
              {t("appTitle")}
            </Typography>
            <Button variant="text" color="inherit" startIcon={<TranslateIcon />} onClick={toggleLang}>
              {t("langLabel")}
            </Button>
            {bothLoaded && (
              <Button variant="outlined" color="inherit" startIcon={<RestartAltIcon />} onClick={clearImages}>
                {t("reset")}
              </Button>
            )}
          </Toolbar>
        </AppBar>

        {bothLoaded ? (
          <Box sx={{ flex: "1 1 auto", minHeight: 0, position: "relative", display: "flex" }}>
            <ImageCompare
              leftSrc={leftImage.url}
              rightSrc={rightImage.url}
              leftLabel={leftImage.name}
              rightLabel={rightImage.name}
              leftFileSize={leftImage.fileSize}
              rightFileSize={rightImage.fileSize}
              onReplaceLeft={() => openFilePicker("left")}
              onReplaceRight={() => openFilePicker("right")}
              onClearLeft={() => clearImage("left")}
              onClearRight={() => clearImage("right")}
            />
          </Box>
        ) : (
          <Container maxWidth="md" sx={{ flex: 1, display: "flex", alignItems: "center", py: { xs: 3, md: 5 } }}>
            <Stack spacing={3} sx={{ width: "100%" }}>
              <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
                <DropZone
                  label={t("beforeLabel")}
                  imageSrc={leftImage?.url ?? null}
                  imageName={leftImage?.name ?? ""}
                  onDrop={(e) => handleDrop(e, "left")}
                  onDragOver={handleDragOver}
                  onClickUpload={() => openFilePicker("left")}
                  onClear={() => clearImage("left")}
                />
                <DropZone
                  label={t("afterLabel")}
                  imageSrc={rightImage?.url ?? null}
                  imageName={rightImage?.name ?? ""}
                  onDrop={(e) => handleDrop(e, "right")}
                  onDragOver={handleDragOver}
                  onClickUpload={() => openFilePicker("right")}
                  onClear={() => clearImage("right")}
                />
              </Box>
              <Paper variant="outlined" sx={{ p: 2, textAlign: "center", bgcolor: "background.paper" }}>
                <Typography variant="body2" color="text.secondary">
                  {t("footerHint")}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.5 }}>
                  {t("compareHint")}
                </Typography>
              </Paper>
            </Stack>
          </Container>
        )}

        <input ref={leftInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChange(e, "left")} />
        <input ref={rightInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={(e) => handleFileChange(e, "right")} />
      </Box>
    </ThemeProvider>
  )
}

interface DropZoneProps {
  label: string
  imageSrc: string | null
  imageName: string
  onDrop: (e: React.DragEvent) => void
  onDragOver: (e: React.DragEvent) => void
  onClickUpload: () => void
  onClear: () => void
}

function DropZone({ label, imageSrc, imageName, onDrop, onDragOver, onClickUpload, onClear }: DropZoneProps) {
  const { t } = useI18n()
  const [dragOver, setDragOver] = useState(false)

  return (
    <Card variant="outlined" sx={{ borderColor: dragOver ? "primary.main" : "divider", bgcolor: dragOver ? "#eef4ef" : "background.paper" }}>
      <CardContent sx={{ p: 0 }}>
        <Box
          sx={{ minHeight: 280, p: 3, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
          onDrop={(e) => {
            setDragOver(false)
            onDrop(e)
          }}
          onDragOver={(e) => {
            setDragOver(true)
            onDragOver(e)
          }}
          onDragLeave={() => setDragOver(false)}
          onClick={() => !imageSrc && onClickUpload()}
        >
          {imageSrc ? (
            <Stack spacing={2} sx={{ width: "100%", alignItems: "center" }}>
              <Box component="img" src={imageSrc} alt={label} sx={{ maxHeight: 180, maxWidth: "100%", objectFit: "contain", borderRadius: 1 }} />
              <Typography variant="body2" color="text.secondary" noWrap sx={{ maxWidth: "100%" }}>
                {imageName}
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" startIcon={<UploadIcon />} onClick={(e) => { e.stopPropagation(); onClickUpload() }}>
                  {t("replace")}
                </Button>
                <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); onClear() }} aria-label={t("remove")}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Stack>
            </Stack>
          ) : (
            <Stack spacing={1.5} sx={{ alignItems: "center", color: "text.secondary", textAlign: "center" }}>
              <UploadIcon color="primary" sx={{ fontSize: 42 }} />
              <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{label}</Typography>
              <Typography variant="body2">{t("dropHint")}</Typography>
            </Stack>
          )}
        </Box>
      </CardContent>
    </Card>
  )
}

export default App
