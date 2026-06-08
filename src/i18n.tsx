import React, { createContext, useContext, useState, useCallback } from "react"

export type Lang = "en" | "zh"

const translations = {
  en: {
    appTitle: "Image Compare",
    reset: "Reset",
    beforeLabel: "Left Image",
    afterLabel: "Right Image",
    dropHint: "Drop image here, press Ctrl+V, or click to browse",
    replace: "Replace",
    remove: "Remove",
    footerHint: "Press Ctrl+V to paste into the page. Pasted images fill left first, then right.",
    compareHint: "Compare images with the same aspect ratio, even at different resolutions, such as before and after super-resolution.",
    zoomTip: "Scroll to zoom · Drag to pan",
    langLabel: "EN",
  },
  zh: {
    appTitle: "双图比较",
    reset: "重置",
    beforeLabel: "左图",
    afterLabel: "右图",
    dropHint: "拖拽图片到此处、按 Ctrl+V 粘贴，或点击浏览",
    replace: "替换",
    remove: "关闭",
    footerHint: "支持在网页里按 Ctrl+V 粘贴。粘贴时会先填充左图，左图已有后再填充右图。",
    compareHint: "本页面可比较同画幅比但分辨率不同的图片，例如超分辨率前后的差别。",
    zoomTip: "滚轮缩放 · 拖拽平移",
    langLabel: "中文",
  },
} as const

export type TranslationKey = keyof (typeof translations)["en"]

interface I18nContextType {
  lang: Lang
  setLang: (lang: Lang) => void
  t: (key: TranslationKey) => string
}

const I18nContext = createContext<I18nContextType>(null!)

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en")

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[lang][key] ?? key
    },
    [lang]
  )

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return useContext(I18nContext)
}
