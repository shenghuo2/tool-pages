import React, { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import ImageCompare from "@/components/ImageCompare"
import { Upload, ImageIcon, X, RotateCcw, Languages } from "lucide-react"
import { useI18n } from "@/i18n"

type ImageSide = "left" | "right"

interface ImageData {
  url: string
  name: string
  fileSize: number
}

function App() {
  const { t, lang, setLang } = useI18n()
  const [leftImage, setLeftImage] = useState<ImageData | null>(null)
  const [rightImage, setRightImage] = useState<ImageData | null>(null)
  const leftInputRef = useRef<HTMLInputElement>(null)
  const rightInputRef = useRef<HTMLInputElement>(null)
  const leftImageRef = useRef<ImageData | null>(null)
  const rightImageRef = useRef<ImageData | null>(null)

  const loadImage = useCallback(
    (file: File, side: ImageSide) => {
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
      } else {
        setRightImage((prev) => {
          if (prev) URL.revokeObjectURL(prev.url)
          return data
        })
      }
    },
    []
  )

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
      const imageItem = Array.from(event.clipboardData?.items ?? []).find((item) =>
        item.type.startsWith("image/")
      )
      const file = imageItem?.getAsFile()

      if (!file) {
        return
      }

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
    <div className="h-screen flex flex-col bg-neutral-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-2 border-b border-neutral-800 bg-neutral-900 shrink-0">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-blue-400" />
          <h1 className="text-base font-semibold">{t("appTitle")}</h1>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleLang}
            className="text-neutral-400 hover:text-white"
          >
            <Languages className="w-4 h-4 mr-1" />
            {t("langLabel")}
          </Button>
          {bothLoaded && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearImages}
              className="text-neutral-400 hover:text-white"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              {t("reset")}
            </Button>
          )}
        </div>
      </header>

      {/* Main content */}
      {bothLoaded ? (
        <div className="flex-1 min-h-0 relative">
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
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Left drop zone */}
            <DropZone
              label={t("beforeLabel")}
              imageSrc={leftImage?.url ?? null}
              imageName={leftImage?.name ?? ""}
              onDrop={(e) => handleDrop(e, "left")}
              onDragOver={handleDragOver}
              onClickUpload={() => openFilePicker("left")}
              onClear={() => clearImage("left")}
            />

            {/* Right drop zone */}
            <DropZone
              label={t("afterLabel")}
              imageSrc={rightImage?.url ?? null}
              imageName={rightImage?.name ?? ""}
              onDrop={(e) => handleDrop(e, "right")}
              onDragOver={handleDragOver}
              onClickUpload={() => openFilePicker("right")}
              onClear={() => clearImage("right")}
            />
          </div>
        </div>
      )}

      <input
        ref={leftInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "left")}
      />
      <input
        ref={rightInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileChange(e, "right")}
      />

      {/* Footer info */}
      <div className="flex flex-col items-center justify-center pb-4 gap-1 px-4 text-center">
        {!bothLoaded && (
          <>
            <span className="text-neutral-500 text-xs">{t("footerHint")}</span>
            <span className="text-neutral-600 text-xs">{t("compareHint")}</span>
          </>
        )}
        <span className="text-neutral-600 text-xs select-none">@shenghuo2</span>
      </div>
    </div>
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

function DropZone({
  label,
  imageSrc,
  imageName,
  onDrop,
  onDragOver,
  onClickUpload,
  onClear,
}: DropZoneProps) {
  const { t } = useI18n()
  const [dragOver, setDragOver] = useState(false)

  return (
    <Card
      className={`bg-neutral-900 border-neutral-700 transition-colors ${
        dragOver ? "border-blue-500 bg-neutral-800" : ""
      }`}
    >
      <CardContent className="p-0">
        <div
          className="flex flex-col items-center justify-center min-h-[280px] p-6 cursor-pointer"
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
            <div className="flex flex-col items-center gap-3 w-full">
              <img
                src={imageSrc}
                alt={label}
                className="max-h-[180px] max-w-full object-contain rounded"
              />
              <p className="text-sm text-neutral-300 truncate max-w-full">
                {imageName}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClickUpload()
                  }}
                  className="text-neutral-300 border-neutral-600"
                >
                  {t("replace")}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onClear()
                  }}
                  className="text-red-400 hover:text-red-300"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-neutral-400">
              <Upload className="w-10 h-10" />
              <p className="text-sm font-medium">{label}</p>
              <p className="text-xs text-neutral-500">
                {t("dropHint")}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default App
